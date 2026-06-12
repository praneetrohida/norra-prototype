import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, SearchField, toast } from "@heroui/react";
import {
  ChevronRight,
  Pencil,
  Phone,
  Plus,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import { EmptyState, Screen } from "../components/Screen";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { OrderCard } from "../components/OrderCard";
import { FormField } from "../components/FormField";
import { useStore } from "../store";

export function CustomersPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const customers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.customers
      .filter((c) => !c.deletedAt)
      .filter(
        (c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [state.customers, query]);

  return (
    <Screen
      action={
        <Button
          aria-label="Add customer"
          isIconOnly
          variant="ghost"
          onPress={() => navigate("/customers/new")}
        >
          <Plus aria-hidden className="size-5" />
        </Button>
      }
      title="Customers"
      withNav
    >
      <div className="flex flex-col gap-4">
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

        {customers.length === 0 ? (
          <EmptyState
            action={
              <Button onPress={() => navigate("/customers/new")}>
                <Plus aria-hidden className="size-4" />
                Add customer
              </Button>
            }
            description="Add the people you take orders from."
            icon={Users}
            title={query ? "No customers match" : "No customers yet"}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {customers.map((c) => (
              <Link key={c.id} to={`/customers/${c.id}`}>
                <Card className="w-full">
                  <Card.Content className="flex items-center gap-3 py-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-secondary">
                      <UserRound aria-hidden className="size-5 text-muted" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">
                        {c.name}
                      </span>
                      <span className="block text-sm text-muted">{c.phone}</span>
                    </span>
                    <ChevronRight aria-hidden className="size-5 text-muted" />
                  </Card.Content>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}

export function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, deleteCustomer } = useStore();
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const customer = state.customers.find((c) => c.id === id && !c.deletedAt);

  if (!customer) {
    return (
      <Screen back="/customers" title="Customer">
        <p className="py-16 text-center text-muted">Customer not found.</p>
      </Screen>
    );
  }

  const orders = state.orders
    .filter((o) => o.customerId === customer.id && !o.deletedAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <Screen
      action={
        <Button
          aria-label="Edit customer"
          isIconOnly
          variant="ghost"
          onPress={() => navigate(`/customers/${customer.id}/edit`)}
        >
          <Pencil aria-hidden className="size-4" />
        </Button>
      }
      back="/customers"
      title={customer.name}
    >
      <div className="flex flex-col gap-4">
        <Card className="w-full">
          <Card.Content className="flex flex-col gap-2 py-3">
            <div className="flex items-center gap-2 text-foreground">
              <Phone aria-hidden className="size-4 text-muted" />
              <span>{customer.phone}</span>
            </div>
            {customer.address ? (
              <p className="whitespace-pre-line text-sm text-muted">
                {customer.address}
              </p>
            ) : null}
            {customer.notes ? (
              <p className="rounded-lg bg-surface-secondary p-2 text-sm text-muted">
                {customer.notes}
              </p>
            ) : null}
          </Card.Content>
        </Card>

        <div>
          <h2 className="mb-2 px-1 text-sm font-semibold text-foreground">
            Orders ({orders.length})
          </h2>
          {orders.length === 0 ? (
            <p className="rounded-xl border border-dashed border-separator p-4 text-center text-sm text-muted">
              No orders for this customer yet.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {orders.map((o) => (
                <OrderCard key={o.id} order={o} />
              ))}
            </div>
          )}
        </div>

        <Button
          fullWidth
          variant="danger-soft"
          onPress={() => setDeleteConfirm(true)}
        >
          <Trash2 aria-hidden className="size-4" />
          Delete customer
        </Button>
      </div>

      <ConfirmDialog
        confirmLabel="Delete"
        description="Past orders keep a snapshot of this customer's details, so history stays intact."
        destructive
        isOpen={deleteConfirm}
        title={`Delete ${customer.name}?`}
        onConfirm={() => {
          deleteCustomer(customer.id);
          toast.success("Customer deleted");
          navigate("/customers", { replace: true });
        }}
        onOpenChange={setDeleteConfirm}
      />
    </Screen>
  );
}

export function CustomerFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, addCustomer, updateCustomer } = useStore();

  const editing = state.customers.find((c) => c.id === id && !c.deletedAt);

  const [name, setName] = useState(editing?.name ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? "");
  const [address, setAddress] = useState(editing?.address ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");

  const save = () => {
    if (!name.trim()) {
      toast.danger("Name is required");
      return;
    }
    if (!phone.trim()) {
      toast.danger("Phone number is required");
      return;
    }
    if (editing) {
      updateCustomer(editing.id, {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });
      toast.success("Customer updated");
      navigate(`/customers/${editing.id}`, { replace: true });
    } else {
      const customer = addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        notes: notes.trim(),
      });
      toast.success("Customer added");
      navigate(`/customers/${customer.id}`, { replace: true });
    }
  };

  return (
    <Screen back title={editing ? "Edit customer" : "New customer"}>
      <div className="flex flex-col gap-4">
        <FormField
          isRequired
          label="Name"
          placeholder="Customer or shop name"
          value={name}
          onChange={setName}
        />
        <FormField
          isRequired
          description="Needed to share orders on WhatsApp."
          inputMode="tel"
          label="Phone"
          placeholder="+91 ..."
          type="tel"
          value={phone}
          onChange={setPhone}
        />
        <FormField
          label="Address"
          multiline
          placeholder="Delivery address (optional)"
          value={address}
          onChange={setAddress}
        />
        <FormField
          label="Notes"
          multiline
          placeholder="Anything to remember (optional)"
          value={notes}
          onChange={setNotes}
        />
        <Button fullWidth className="mt-2" size="lg" onPress={save}>
          {editing ? "Save changes" : "Add customer"}
        </Button>
      </div>
    </Screen>
  );
}
