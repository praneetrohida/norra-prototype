import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Label,
  Modal,
  SearchField,
  Switch,
  TextField,
  toast,
} from "@heroui/react";
import { ChevronDown, Plus, Trash2, UserRound, UserRoundPlus } from "lucide-react";
import { Screen } from "../components/Screen";
import { FormField } from "../components/FormField";
import { useStore } from "../store";
import { formatINR } from "../lib/format";
import type { Customer, OrderInput } from "../types";

interface LineDraft {
  key: string;
  itemName: string;
  catalogItemId?: string;
  qty: string;
  unit: string;
  unitPrice: string;
}

const draftKey = () => Math.random().toString(36).slice(2);

function CustomerPicker({
  isOpen,
  onOpenChange,
  onSelect,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (customer: Customer) => void;
}) {
  const { state, addCustomer } = useStore();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const customers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.customers
      .filter((c) => !c.deletedAt)
      .filter(
        (c) =>
          !q || c.name.toLowerCase().includes(q) || c.phone.includes(q),
      );
  }, [state.customers, query]);

  const select = (customer: Customer) => {
    onSelect(customer);
    onOpenChange(false);
    setQuery("");
    setAdding(false);
  };

  const saveNew = () => {
    if (!newName.trim() || !newPhone.trim()) {
      toast.danger("Name and phone are required");
      return;
    }
    const customer = addCustomer({
      name: newName.trim(),
      phone: newPhone.trim(),
      address: "",
      notes: "",
    });
    setNewName("");
    setNewPhone("");
    select(customer);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container placement="bottom" scroll="inside">
          <Modal.Dialog className="min-h-[60dvh]">
            <Modal.Header>
              <Modal.Heading>Select customer</Modal.Heading>
              <Modal.CloseTrigger />
            </Modal.Header>
            <Modal.Body>
              {adding ? (
                <div className="flex flex-col gap-4 pb-2">
                  <FormField
                    isRequired
                    label="Name"
                    placeholder="Customer name"
                    value={newName}
                    onChange={setNewName}
                  />
                  <FormField
                    isRequired
                    inputMode="tel"
                    label="Phone"
                    placeholder="+91 ..."
                    type="tel"
                    value={newPhone}
                    onChange={setNewPhone}
                  />
                  <div className="flex gap-3">
                    <Button
                      fullWidth
                      variant="tertiary"
                      onPress={() => setAdding(false)}
                    >
                      Back
                    </Button>
                    <Button fullWidth onPress={saveNew}>
                      Add & select
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pb-2">
                  <SearchField
                    aria-label="Search customers"
                    fullWidth
                    value={query}
                    onChange={setQuery}
                  >
                    <SearchField.Group>
                      <SearchField.SearchIcon />
                      <SearchField.Input placeholder="Search name or phone" />
                      <SearchField.ClearButton />
                    </SearchField.Group>
                  </SearchField>
                  <Button
                    fullWidth
                    variant="secondary"
                    onPress={() => setAdding(true)}
                  >
                    <UserRoundPlus aria-hidden className="size-4" />
                    Add new customer
                  </Button>
                  <div className="flex flex-col">
                    {customers.map((c) => (
                      <button
                        key={c.id}
                        className="flex min-h-14 items-center gap-3 border-b border-separator text-left last:border-b-0"
                        type="button"
                        onClick={() => select(c)}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
                          <UserRound aria-hidden className="size-4 text-muted" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-foreground">
                            {c.name}
                          </span>
                          <span className="block text-sm text-muted">
                            {c.phone}
                          </span>
                        </span>
                      </button>
                    ))}
                    {customers.length === 0 ? (
                      <p className="py-8 text-center text-sm text-muted">
                        No customers match "{query}".
                      </p>
                    ) : null}
                  </div>
                </div>
              )}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export function OrderFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, createOrder, updateOrder } = useStore();

  const editing = state.orders.find((o) => o.id === id && !o.deletedAt);

  const [customer, setCustomer] = useState<Customer | null>(() =>
    editing
      ? (state.customers.find((c) => c.id === editing.customerId) ?? null)
      : null,
  );
  const [lines, setLines] = useState<LineDraft[]>(() =>
    editing
      ? editing.lines.map((l) => ({
          key: draftKey(),
          itemName: l.itemName,
          catalogItemId: l.catalogItemId,
          qty: String(l.qty),
          unit: l.unit,
          unitPrice: l.unitPrice != null ? String(l.unitPrice) : "",
        }))
      : [],
  );
  const [priced, setPriced] = useState(editing?.priced ?? false);
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [itemQuery, setItemQuery] = useState("");

  const suggestions = useMemo(() => {
    const q = itemQuery.trim().toLowerCase();
    if (!q) return [];
    return state.catalog
      .filter((i) => !i.archivedAt && i.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [state.catalog, itemQuery]);

  const addLine = (draft: Omit<LineDraft, "key">) => {
    setLines((ls) => [...ls, { ...draft, key: draftKey() }]);
    setItemQuery("");
  };

  const patchLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const removeLine = (key: string) => {
    setLines((ls) => ls.filter((l) => l.key !== key));
  };

  const subtotal = lines.reduce(
    (sum, l) => sum + (parseFloat(l.qty) || 0) * (parseFloat(l.unitPrice) || 0),
    0,
  );

  const save = () => {
    if (!customer) {
      toast.danger("Pick a customer first");
      return;
    }
    if (lines.length === 0) {
      toast.danger("Add at least one item");
      return;
    }
    for (const l of lines) {
      const qty = parseFloat(l.qty);
      if (!l.itemName.trim()) {
        toast.danger("Every item needs a name");
        return;
      }
      if (!(qty > 0)) {
        toast.danger(`Quantity for "${l.itemName}" must be greater than 0`);
        return;
      }
    }
    const input: OrderInput = {
      customerId: customer.id,
      priced,
      notes: notes.trim(),
      lines: lines.map((l) => ({
        itemName: l.itemName.trim(),
        catalogItemId: l.catalogItemId,
        qty: parseFloat(l.qty),
        unit: l.unit.trim() || "piece",
        unitPrice:
          priced && l.unitPrice !== "" ? parseFloat(l.unitPrice) : undefined,
      })),
    };
    if (editing) {
      updateOrder(editing.id, input);
      toast.success("Order updated");
      navigate(`/orders/${editing.id}`, { replace: true });
    } else {
      const order = createOrder(input);
      toast.success(`Order #${String(order.number).padStart(6, "0")} created`);
      navigate(`/orders/${order.id}`, { replace: true });
    }
  };

  return (
    <Screen back title={editing ? "Edit order" : "New order"}>
      <div className="flex flex-col gap-5 pb-28">
        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-foreground">
            Customer
          </h2>
          <button
            className="flex min-h-14 w-full items-center gap-3 rounded-xl border border-separator bg-surface px-3 text-left"
            type="button"
            onClick={() => setPickerOpen(true)}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
              <UserRound aria-hidden className="size-4 text-muted" />
            </span>
            {customer ? (
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">
                  {customer.name}
                </span>
                <span className="block text-sm text-muted">{customer.phone}</span>
              </span>
            ) : (
              <span className="flex-1 text-muted">Select customer</span>
            )}
            <ChevronDown aria-hidden className="size-5 shrink-0 text-muted" />
          </button>
        </section>

        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-foreground">
            Items
          </h2>
          <TextField
            aria-label="Add item"
            fullWidth
            value={itemQuery}
            onChange={setItemQuery}
          >
            <Input placeholder="Type an item name to add…" />
          </TextField>
          {itemQuery.trim() ? (
            <Card className="mt-2 w-full">
              <Card.Content className="flex flex-col py-1">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    className="flex min-h-12 items-center justify-between border-b border-separator text-left last:border-b-0"
                    type="button"
                    onClick={() =>
                      addLine({
                        itemName: item.name,
                        catalogItemId: item.id,
                        qty: "1",
                        unit: item.unit || "piece",
                        unitPrice:
                          item.defaultPrice != null
                            ? String(item.defaultPrice)
                            : "",
                      })
                    }
                  >
                    <span className="font-medium text-foreground">
                      {item.name}
                    </span>
                    <span className="text-sm text-muted">
                      {item.unit}
                      {item.defaultPrice != null
                        ? ` · ${formatINR(item.defaultPrice)}`
                        : ""}
                    </span>
                  </button>
                ))}
                <button
                  className="flex min-h-12 items-center gap-2 text-left"
                  type="button"
                  onClick={() =>
                    addLine({
                      itemName: itemQuery.trim(),
                      qty: "1",
                      unit: "piece",
                      unitPrice: "",
                    })
                  }
                >
                  <Plus aria-hidden className="size-4 text-accent" />
                  <span className="text-accent">
                    Add "{itemQuery.trim()}" as a new item
                  </span>
                </button>
              </Card.Content>
            </Card>
          ) : null}

          <div className="mt-3 flex flex-col gap-2">
            {lines.length === 0 ? (
              <p className="rounded-xl border border-dashed border-separator p-4 text-center text-sm text-muted">
                No items yet. Search the catalog above or type any name to add
                a freeform item.
              </p>
            ) : null}
            {lines.map((line) => (
              <Card key={line.key} className="w-full">
                <Card.Content className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate font-medium text-foreground">
                      {line.itemName}
                    </p>
                    <Button
                      aria-label={`Remove ${line.itemName}`}
                      isIconOnly
                      size="sm"
                      variant="ghost"
                      onPress={() => removeLine(line.key)}
                    >
                      <Trash2 aria-hidden className="size-4 text-danger" />
                    </Button>
                  </div>
                  <div className="mt-2 flex items-end gap-2">
                    <TextField
                      className="w-24"
                      value={line.qty}
                      onChange={(v) => patchLine(line.key, { qty: v })}
                    >
                      <Label>Qty</Label>
                      <Input inputMode="decimal" />
                    </TextField>
                    <TextField
                      className="w-24"
                      value={line.unit}
                      onChange={(v) => patchLine(line.key, { unit: v })}
                    >
                      <Label>Unit</Label>
                      <Input />
                    </TextField>
                    {priced ? (
                      <TextField
                        className="flex-1"
                        value={line.unitPrice}
                        onChange={(v) => patchLine(line.key, { unitPrice: v })}
                      >
                        <Label>Price / unit (₹)</Label>
                        <Input inputMode="decimal" placeholder="0.00" />
                      </TextField>
                    ) : null}
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <Switch
            isSelected={priced}
            onChange={setPriced}
            className="w-full justify-between"
          >
            <Switch.Content>
              <p className="font-medium text-foreground">Include prices</p>
              <p className="text-sm text-muted">
                Show rates and a total on this order
              </p>
            </Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch>

          <FormField
            label="Order notes"
            multiline
            placeholder="e.g. Deliver before 6pm"
            value={notes}
            onChange={setNotes}
          />
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-separator bg-surface px-4 py-3 pb-safe">
        {priced ? (
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold text-foreground">
              {formatINR(subtotal)}
            </span>
          </div>
        ) : null}
        <Button fullWidth size="lg" onPress={save}>
          {editing ? "Save changes" : "Save order"}
        </Button>
      </div>

      <CustomerPicker
        isOpen={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={setCustomer}
      />
    </Screen>
  );
}
