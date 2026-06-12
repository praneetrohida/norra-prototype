import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, SearchField, Tabs } from "@heroui/react";
import { ClipboardList, Plus } from "lucide-react";
import { EmptyState, Screen } from "../components/Screen";
import { OrderCard } from "../components/OrderCard";
import { useStore } from "../store";
import { orderNumber } from "../lib/format";
import type { Order } from "../types";

function OrderList({ orders, tab }: { orders: Order[]; tab: string }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        description={
          tab === "pending"
            ? "Create an order to get started."
            : "Orders move here when every item is ticked off."
        }
        icon={ClipboardList}
        title={tab === "pending" ? "No pending orders" : "No completed orders"}
      />
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {orders.map((o) => (
        <OrderCard key={o.id} order={o} />
      ))}
    </div>
  );
}

export function OrdersPage() {
  const { state } = useStore();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "completed" ? "completed" : "pending";
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.orders
      .filter((o) => !o.deletedAt)
      .filter(
        (o) =>
          !q ||
          orderNumber(o.number).includes(q) ||
          String(o.number).includes(q) ||
          o.customerSnapshot.name.toLowerCase().includes(q),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state.orders, query]);

  const pending = visible.filter((o) => o.status === "pending");
  const completed = visible.filter((o) => o.status === "completed");

  return (
    <Screen title="Orders" withNav>
      <div className="flex flex-col gap-4">
        <SearchField
          aria-label="Search orders"
          fullWidth
          value={query}
          onChange={setQuery}
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search order no. or customer" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <Tabs
          selectedKey={tab}
          onSelectionChange={(key) =>
            setParams(key === "completed" ? { tab: "completed" } : {})
          }
        >
          <Tabs.ListContainer className="w-full">
            <Tabs.List aria-label="Order status" className="w-full">
              <Tabs.Tab className="flex-1 justify-center" id="pending">
                Pending ({pending.length})
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab className="flex-1 justify-center" id="completed">
                Completed ({completed.length})
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
          <Tabs.Panel className="pt-4" id="pending">
            <OrderList orders={pending} tab="pending" />
          </Tabs.Panel>
          <Tabs.Panel className="pt-4" id="completed">
            <OrderList orders={completed} tab="completed" />
          </Tabs.Panel>
        </Tabs>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md px-4 pb-3">
        <Button
          fullWidth
          size="lg"
          className="shadow-lg"
          onPress={() => navigate("/orders/new")}
        >
          <Plus aria-hidden className="size-5" />
          New order
        </Button>
      </div>
    </Screen>
  );
}
