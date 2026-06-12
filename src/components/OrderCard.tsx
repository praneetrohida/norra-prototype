import { Link } from "react-router-dom";
import { Card, Chip } from "@heroui/react";
import { ChevronRight } from "lucide-react";
import type { Order } from "../types";
import { formatDate, formatINR, orderNumber, orderTotal } from "../lib/format";

export function OrderCard({ order }: { order: Order }) {
  const fulfilled = order.lines.filter((l) => l.fulfilledAt).length;

  return (
    <Link to={`/orders/${order.id}`} className="block">
      <Card className="w-full rounded-2xl p-0">
        <Card.Content className="flex-row items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">
              {order.customerSnapshot.name}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted">
              <span className="font-mono">{orderNumber(order.number)}</span>
              {" · "}
              {order.lines.length} {order.lines.length === 1 ? "item" : "items"}
              {" · "}
              {formatDate(order.createdAt)}
              {order.priced ? ` · ${formatINR(orderTotal(order))}` : ""}
            </p>
          </div>
          {order.status === "pending" ? (
            <Chip className="shrink-0" color="warning" size="sm" variant="soft">
              <Chip.Label>
                {fulfilled}/{order.lines.length} done
              </Chip.Label>
            </Chip>
          ) : (
            <Chip className="shrink-0" color="success" size="sm" variant="soft">
              <Chip.Label>Completed</Chip.Label>
            </Chip>
          )}
          <ChevronRight aria-hidden className="size-5 shrink-0 text-muted" />
        </Card.Content>
      </Card>
    </Link>
  );
}
