import type { Order, OrderLine } from "../types";

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function orderNumber(n: number): string {
  return `#${String(n).padStart(6, "0")}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function lineTotal(line: OrderLine): number {
  return line.qty * (line.unitPrice ?? 0);
}

export function orderTotal(order: Order): number {
  return order.lines.reduce((sum, l) => sum + lineTotal(l), 0);
}

export function formatQty(qty: number): string {
  return Number.isInteger(qty) ? String(qty) : String(qty);
}
