import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, Chip, SearchField, toast } from "@heroui/react";
import { Archive, ArchiveRestore, ChevronRight, Package, Plus } from "lucide-react";
import { EmptyState, Screen } from "../components/Screen";
import { FormField } from "../components/FormField";
import { useStore } from "../store";
import { formatINR } from "../lib/format";
import type { CatalogItem } from "../types";

function ItemRow({ item }: { item: CatalogItem }) {
  return (
    <Link to={`/catalog/${item.id}/edit`}>
      <Card className="w-full">
        <Card.Content className="flex items-center gap-3 py-3">
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate font-medium text-foreground">
                {item.name}
              </span>
              {item.archivedAt ? (
                <Chip color="default" size="sm" variant="soft">
                  <Chip.Label>Archived</Chip.Label>
                </Chip>
              ) : null}
            </span>
            <span className="block text-sm text-muted">
              {item.unit || "no unit"}
              {item.defaultPrice != null
                ? ` · ${formatINR(item.defaultPrice)}`
                : " · no default price"}
            </span>
          </span>
          <ChevronRight aria-hidden className="size-5 text-muted" />
        </Card.Content>
      </Card>
    </Link>
  );
}

export function CatalogPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.catalog.filter(
      (i) => !q || i.name.toLowerCase().includes(q),
    );
  }, [state.catalog, query]);

  const active = items.filter((i) => !i.archivedAt);
  const archived = items.filter((i) => i.archivedAt);

  return (
    <Screen
      action={
        <Button
          aria-label="Add catalog item"
          isIconOnly
          variant="ghost"
          onPress={() => navigate("/catalog/new")}
        >
          <Plus aria-hidden className="size-5" />
        </Button>
      }
      title="Catalog"
      withNav
    >
      <div className="flex flex-col gap-4">
        <SearchField
          aria-label="Search catalog"
          fullWidth
          value={query}
          onChange={setQuery}
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search items" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        {active.length === 0 && archived.length === 0 ? (
          <EmptyState
            action={
              <Button onPress={() => navigate("/catalog/new")}>
                <Plus aria-hidden className="size-4" />
                Add item
              </Button>
            }
            description="Catalog items speed up order entry with units and default prices."
            icon={Package}
            title={query ? "No items match" : "No catalog items yet"}
          />
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {active.map((i) => (
                <ItemRow key={i.id} item={i} />
              ))}
            </div>
            {archived.length > 0 ? (
              <div>
                <button
                  className="flex min-h-11 items-center gap-1 px-1 text-sm font-medium text-muted"
                  type="button"
                  onClick={() => setShowArchived((v) => !v)}
                >
                  <Archive aria-hidden className="size-4" />
                  Archived ({archived.length}) {showArchived ? "▾" : "▸"}
                </button>
                {showArchived ? (
                  <div className="mt-1 flex flex-col gap-3">
                    {archived.map((i) => (
                      <ItemRow key={i.id} item={i} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </>
        )}
      </div>
    </Screen>
  );
}

export function CatalogFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addCatalogItem, updateCatalogItem } = useStore();

  const editing = state.catalog.find((i) => i.id === id);

  const [name, setName] = useState(editing?.name ?? "");
  const [unit, setUnit] = useState(editing?.unit ?? "");
  const [price, setPrice] = useState(
    editing?.defaultPrice != null ? String(editing.defaultPrice) : "",
  );

  const save = () => {
    if (!name.trim()) {
      toast.danger("Item name is required");
      return;
    }
    const defaultPrice = price.trim() === "" ? undefined : parseFloat(price);
    if (defaultPrice !== undefined && !(defaultPrice >= 0)) {
      toast.danger("Default price must be a valid number");
      return;
    }
    if (editing) {
      updateCatalogItem(editing.id, {
        name: name.trim(),
        unit: unit.trim(),
        defaultPrice,
      });
      toast.success("Item updated");
    } else {
      addCatalogItem({ name: name.trim(), unit: unit.trim(), defaultPrice });
      toast.success("Item added");
    }
    navigate("/catalog", { replace: true });
  };

  const toggleArchive = () => {
    if (!editing) return;
    const archiving = !editing.archivedAt;
    updateCatalogItem(editing.id, {
      archivedAt: archiving ? new Date().toISOString() : undefined,
    });
    toast.success(archiving ? "Item archived" : "Item restored");
    navigate("/catalog", { replace: true });
  };

  return (
    <Screen back title={editing ? "Edit item" : "New item"}>
      <div className="flex flex-col gap-4">
        <FormField
          isRequired
          label="Name"
          placeholder="e.g. Basmati Rice"
          value={name}
          onChange={setName}
        />
        <FormField
          description="e.g. kg, piece, box, litre"
          label="Unit"
          placeholder="kg"
          value={unit}
          onChange={setUnit}
        />
        <FormField
          description="Pre-fills the price on priced orders. Leave blank if it varies."
          inputMode="decimal"
          label="Default price (₹)"
          placeholder="0.00"
          value={price}
          onChange={setPrice}
        />
        <Button fullWidth className="mt-2" size="lg" onPress={save}>
          {editing ? "Save changes" : "Add item"}
        </Button>
        {editing ? (
          <>
            <Button fullWidth variant="secondary" onPress={toggleArchive}>
              {editing.archivedAt ? (
                <>
                  <ArchiveRestore aria-hidden className="size-4" />
                  Restore item
                </>
              ) : (
                <>
                  <Archive aria-hidden className="size-4" />
                  Archive item
                </>
              )}
            </Button>
            <p className="-mt-1 text-center text-xs text-muted">
              Archived items are hidden from order entry. Past orders keep
              their snapshot.
            </p>
          </>
        ) : null}
      </div>
    </Screen>
  );
}
