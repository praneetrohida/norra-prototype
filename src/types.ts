export interface Business {
  name: string;
  address: string;
  phone: string;
  email: string;
  pan: string;
  gst: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
  deletedAt?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  unit: string;
  defaultPrice?: number;
  archivedAt?: string;
}

export interface OrderLine {
  id: string;
  itemName: string;
  catalogItemId?: string;
  qty: number;
  unit: string;
  unitPrice?: number;
  fulfilledAt?: string;
}

export interface CustomerSnapshot {
  name: string;
  phone: string;
  address: string;
}

export type OrderStatus = "pending" | "completed";

export interface Order {
  id: string;
  number: number;
  customerId: string;
  customerSnapshot: CustomerSnapshot;
  status: OrderStatus;
  priced: boolean;
  notes: string;
  lines: OrderLine[];
  createdAt: string;
  completedAt?: string;
  deletedAt?: string;
}

export interface OrderLineInput {
  itemName: string;
  catalogItemId?: string;
  qty: number;
  unit: string;
  unitPrice?: number;
}

export interface OrderInput {
  customerId: string;
  priced: boolean;
  notes: string;
  lines: OrderLineInput[];
}

export interface AppState {
  signedIn: boolean;
  ownerEmail: string;
  business: Business | null;
  customers: Customer[];
  catalog: CatalogItem[];
  orders: Order[];
  orderCounter: number;
}
