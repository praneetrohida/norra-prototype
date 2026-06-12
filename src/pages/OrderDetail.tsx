import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, Card, Checkbox, Chip, Separator, toast } from "@heroui/react";
import {
  Check,
  ChevronRight,
  Pencil,
  RotateCcw,
  Share2,
  Trash2,
} from "lucide-react";
import { Screen } from "../components/Screen";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ShareSheet } from "../components/ShareSheet";
import { useStore } from "../store";
import {
  formatDate,
  formatINR,
  lineTotal,
  orderNumber,
  orderTotal,
} from "../lib/format";
import type { OrderLine } from "../types";

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, toggleLine, reopenOrder, deleteOrder } = useStore();
  const [shareOpen, setShareOpen] = useState(false);
  const [reopenConfirm, setReopenConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const order = state.orders.find((o) => o.id === id && !o.deletedAt);

  if (!order) {
    return (
      <Screen back="/orders" title="Order">
        <p className="py-16 text-center text-muted">Order not found.</p>
      </Screen>
    );
  }

  const pending = order.status === "pending";
  const fulfilled = order.lines.filter((l) => l.fulfilledAt).length;
  const anyFulfilled = fulfilled > 0;
  const customer = state.customers.find((c) => c.id === order.customerId);

  const handleToggle = (line: OrderLine) => {
    const isLastUnfulfilled =
      !line.fulfilledAt &&
      order.lines.every((l) => l.id === line.id || l.fulfilledAt);
    toggleLine(order.id, line.id);
    if (isLastUnfulfilled) toast.success("Marked as completed");
  };

  return (
    <Screen back="/orders" title={`Order ${orderNumber(order.number)}`}>
      <div className="flex flex-col gap-4">
        <Card className="w-full">
          <Card.Content className="py-3">
            <div className="flex items-center justify-between">
              <Chip
                color={pending ? "warning" : "success"}
                size="sm"
                variant="soft"
              >
                <Chip.Label>{pending ? "Pending" : "Completed"}</Chip.Label>
              </Chip>
              <span className="text-sm text-muted">
                {formatDate(order.createdAt)}
              </span>
            </div>
            {customer && !customer.deletedAt ? (
              <Link
                className="mt-2 flex min-h-11 items-center justify-between"
                to={`/customers/${customer.id}`}
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {order.customerSnapshot.name}
                  </p>
                  <p className="text-sm text-muted">
                    {order.customerSnapshot.phone}
                  </p>
                </div>
                <ChevronRight aria-hidden className="size-5 text-muted" />
              </Link>
            ) : (
              <div className="mt-2">
                <p className="font-semibold text-foreground">
                  {order.customerSnapshot.name}
                </p>
                <p className="text-sm text-muted">
                  {order.customerSnapshot.phone}
                </p>
              </div>
            )}
            {order.priced ? (
              <>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Order total</span>
                  <span className="font-semibold text-foreground">
                    {formatINR(orderTotal(order))}
                  </span>
                </div>
              </>
            ) : null}
          </Card.Content>
        </Card>

        <div>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-foreground">Items</h2>
            <span className="text-sm text-muted">
              {fulfilled} of {order.lines.length} fulfilled
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {order.lines.map((line) => {
              const done = !!line.fulfilledAt;
              const content = (
                <div
                  className={`min-w-0 flex-1 ${done ? "opacity-50" : ""}`}
                >
                  <p
                    className={`font-medium text-foreground ${
                      done ? "line-through" : ""
                    }`}
                  >
                    {line.itemName}
                  </p>
                  <p className="text-sm text-muted">
                    {line.qty} {line.unit}
                    {order.priced && line.unitPrice != null
                      ? ` × ${formatINR(line.unitPrice)} = ${formatINR(lineTotal(line))}`
                      : ""}
                  </p>
                </div>
              );
              return pending ? (
                <Checkbox
                  key={line.id}
                  className="w-full items-start gap-3 rounded-xl border border-separator bg-surface p-3"
                  isSelected={done}
                  onChange={() => handleToggle(line)}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator />
                  </Checkbox.Control>
                  <Checkbox.Content>{content}</Checkbox.Content>
                </Checkbox>
              ) : (
                <div
                  key={line.id}
                  className="flex w-full items-start gap-3 rounded-xl border border-separator bg-surface p-3"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-success text-success-foreground">
                    <Check aria-hidden className="size-3.5" />
                  </span>
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        {order.notes ? (
          <Card className="w-full">
            <Card.Content className="py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Notes
              </p>
              <p className="mt-1 text-sm text-foreground">{order.notes}</p>
            </Card.Content>
          </Card>
        ) : null}

        <div className="mt-2 flex flex-col gap-3">
          <Button fullWidth size="lg" onPress={() => setShareOpen(true)}>
            <Share2 aria-hidden className="size-5" />
            Share on WhatsApp
          </Button>
          {pending ? (
            <Button
              fullWidth
              isDisabled={anyFulfilled}
              variant="secondary"
              onPress={() => navigate(`/orders/${order.id}/edit`)}
            >
              <Pencil aria-hidden className="size-4" />
              Edit order
            </Button>
          ) : (
            <Button
              fullWidth
              variant="secondary"
              onPress={() => setReopenConfirm(true)}
            >
              <RotateCcw aria-hidden className="size-4" />
              Reopen order
            </Button>
          )}
          {pending && anyFulfilled ? (
            <p className="-mt-1 text-center text-xs text-muted">
              Editing is locked once fulfilment has started.
            </p>
          ) : null}
          <Button
            fullWidth
            variant="danger-soft"
            onPress={() => setDeleteConfirm(true)}
          >
            <Trash2 aria-hidden className="size-4" />
            Delete order
          </Button>
        </div>
      </div>

      <ShareSheet
        business={state.business}
        isOpen={shareOpen}
        order={order}
        onOpenChange={setShareOpen}
      />
      <ConfirmDialog
        confirmLabel="Reopen"
        description="The order moves back to Pending. Item ticks are kept, so you can untick whichever item was wrong."
        isOpen={reopenConfirm}
        title="Reopen this order?"
        onConfirm={() => {
          reopenOrder(order.id);
          toast.info("Order moved back to Pending");
        }}
        onOpenChange={setReopenConfirm}
      />
      <ConfirmDialog
        confirmLabel="Delete"
        description={`Order ${orderNumber(order.number)} will be removed from your lists.`}
        destructive
        isOpen={deleteConfirm}
        title="Delete this order?"
        onConfirm={() => {
          deleteOrder(order.id);
          toast.success("Order deleted");
          navigate("/orders", { replace: true });
        }}
        onOpenChange={setDeleteConfirm}
      />
    </Screen>
  );
}
