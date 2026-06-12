import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Separator, toast } from "@heroui/react";
import { Download, LogOut, RotateCcw } from "lucide-react";
import { Screen } from "../components/Screen";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { FormField } from "../components/FormField";
import { useStore } from "../store";
import { orderNumber, orderTotal } from "../lib/format";

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((c) => `"${c.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function SettingsPage() {
  const { state, saveBusiness, signOut, resetDemo } = useStore();
  const navigate = useNavigate();
  const b = state.business;

  const [name, setName] = useState(b?.name ?? "");
  const [address, setAddress] = useState(b?.address ?? "");
  const [phone, setPhone] = useState(b?.phone ?? "");
  const [email, setEmail] = useState(b?.email ?? "");
  const [pan, setPan] = useState(b?.pan ?? "");
  const [gst, setGst] = useState(b?.gst ?? "");
  const [resetConfirm, setResetConfirm] = useState(false);

  const saveProfile = () => {
    if (!name.trim() || !phone.trim()) {
      toast.danger("Business name and phone are required");
      return;
    }
    saveBusiness({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      pan: pan.trim(),
      gst: gst.trim(),
    });
    toast.success("Business profile saved");
  };

  const exportOrders = () => {
    const rows: string[][] = [
      ["Order", "Date", "Status", "Customer", "Phone", "Item", "Qty", "Unit", "Unit price", "Order total"],
    ];
    for (const o of state.orders.filter((o) => !o.deletedAt)) {
      for (const l of o.lines) {
        rows.push([
          orderNumber(o.number),
          o.createdAt.slice(0, 10),
          o.status,
          o.customerSnapshot.name,
          o.customerSnapshot.phone,
          l.itemName,
          String(l.qty),
          l.unit,
          o.priced && l.unitPrice != null ? l.unitPrice.toFixed(2) : "",
          o.priced ? orderTotal(o).toFixed(2) : "",
        ]);
      }
    }
    downloadCSV("orders.csv", rows);
    toast.success("Orders exported");
  };

  const exportCustomers = () => {
    const rows: string[][] = [["Name", "Phone", "Address", "Notes"]];
    for (const c of state.customers.filter((c) => !c.deletedAt)) {
      rows.push([c.name, c.phone, c.address, c.notes]);
    }
    downloadCSV("customers.csv", rows);
    toast.success("Customers exported");
  };

  const exportCatalog = () => {
    const rows: string[][] = [["Name", "Unit", "Default price", "Archived"]];
    for (const i of state.catalog) {
      rows.push([
        i.name,
        i.unit,
        i.defaultPrice != null ? i.defaultPrice.toFixed(2) : "",
        i.archivedAt ? "yes" : "no",
      ]);
    }
    downloadCSV("catalog.csv", rows);
    toast.success("Catalog exported");
  };

  return (
    <Screen title="Settings" withNav>
      <div className="flex flex-col gap-6">
        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-foreground">
            Business profile
          </h2>
          <Card className="w-full">
            <Card.Content className="flex flex-col gap-4 py-4">
              <FormField isRequired label="Business name" value={name} onChange={setName} />
              <FormField label="Address" multiline value={address} onChange={setAddress} />
              <FormField
                isRequired
                inputMode="tel"
                label="Contact phone"
                type="tel"
                value={phone}
                onChange={setPhone}
              />
              <FormField label="Contact email" type="email" value={email} onChange={setEmail} />
              <FormField label="PAN number" value={pan} onChange={setPan} />
              <FormField label="GST number" value={gst} onChange={setGst} />
              <Button fullWidth onPress={saveProfile}>
                Save profile
              </Button>
            </Card.Content>
          </Card>
        </section>

        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-foreground">
            Your data
          </h2>
          <Card className="w-full">
            <Card.Content className="flex flex-col gap-3 py-4">
              <p className="text-sm text-muted">
                Export everything as CSV — your data stays yours.
              </p>
              <Button fullWidth variant="secondary" onPress={exportOrders}>
                <Download aria-hidden className="size-4" />
                Export orders
              </Button>
              <Button fullWidth variant="secondary" onPress={exportCustomers}>
                <Download aria-hidden className="size-4" />
                Export customers
              </Button>
              <Button fullWidth variant="secondary" onPress={exportCatalog}>
                <Download aria-hidden className="size-4" />
                Export catalog
              </Button>
            </Card.Content>
          </Card>
        </section>

        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-foreground">
            Account
          </h2>
          <Card className="w-full">
            <Card.Content className="flex flex-col gap-3 py-4">
              <p className="text-sm text-muted">
                Signed in as{" "}
                <span className="font-medium text-foreground">
                  {state.ownerEmail}
                </span>
              </p>
              <Button
                fullWidth
                variant="secondary"
                onPress={() => {
                  signOut();
                  navigate("/signin", { replace: true });
                }}
              >
                <LogOut aria-hidden className="size-4" />
                Sign out
              </Button>
              <Separator />
              <Button
                fullWidth
                variant="danger-soft"
                onPress={() => setResetConfirm(true)}
              >
                <RotateCcw aria-hidden className="size-4" />
                Reset demo data
              </Button>
            </Card.Content>
          </Card>
        </section>

        <p className="text-center text-xs text-muted">
          Order Tracker — clickable prototype
        </p>
      </div>

      <ConfirmDialog
        confirmLabel="Reset"
        description="All demo orders, customers and settings are cleared and the app returns to the sign-in screen."
        destructive
        isOpen={resetConfirm}
        title="Reset demo data?"
        onConfirm={() => {
          resetDemo();
          navigate("/signin", { replace: true });
        }}
        onOpenChange={setResetConfirm}
      />
    </Screen>
  );
}
