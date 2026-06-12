import { Link } from "react-router-dom";
import { Card, Chip } from "@heroui/react";
import { ChevronRight } from "lucide-react";
import type { Order } from "../types";
import { formatDate, formatINR, orderNumber, orderTotal } from "../lib/format";

export function OrderCard({ order }: { order: Order }) {
  const fulfilled = order.lines.filter((l) => l.fulfilledAt).length;

  return (
    <Link to={`/orders/${order.id}`} className="block">
      <Card className="w-full">
        <Card.Content className="flex items-center gap-3 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-foreground">
                {orderNumber(order.number)}
              </span>
              {order.status === "pending" ? (
                <Chip color="warning" size="sm" variant="soft">
                  <Chip.Label>
                    {fulfilled}/{order.lines.length} done
                  </Chip.Label>
                </Chip>
              ) : (
                <Chip color="success" size="sm" variant="soft">
                  <Chip.Label>Completed</Chip.Label>
                </Chip>
              )}
            </div>
            <p className="mt-0.5 truncate font-medium text-foreground">
              {order.customerSnapshot.name}
            </p>
            <p className="text-sm text-muted">
              {order.lines.length} {order.lines.length === 1 ? "item" : "items"}
              {" · "}
              {formatDate(order.createdAt)}
              {order.priced ? ` · ${formatINR(orderTotal(order))}` : ""}
            </p>
          </div>
          <ChevronRight aria-hidden className="size-5 shrink-0 text-muted" />
        </Card.Content>
      </Card>
    </Link>
  );
}
