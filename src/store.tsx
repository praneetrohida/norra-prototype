/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  AppState,
  Business,
  CatalogItem,
  Customer,
  Order,
  OrderInput,
} from "./types";

const STORAGE_KEY = "order-tracker-prototype";

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const daysAgo = (days: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 24 - days, 0, 0);
  return d.toISOString();
};

const emptyState: AppState = {
  signedIn: false,
  ownerEmail: "",
  business: null,
  customers: [],
  catalog: [],
  orders: [],
  orderCounter: 0,
};

function seedState(email: string): AppState {
  const customers: Customer[] = [
    {
      id: "c1",
      name: "Rohan Mehta",
      phone: "+91 98765 43210",
      address: "12, Commercial Street,\nShivajinagar, Bengaluru",
      notes: "Prefers delivery before noon.",
      createdAt: daysAgo(40),
    },
    {
      id: "c2",
      name: "Trends Boutique",
      phone: "+91 91234 56780",
      address: "Shop 4, Market Complex,\nJayanagar 4th Block",
      notes: "",
      createdAt: daysAgo(32),
    },
    {
      id: "c3",
      name: "Imran Sheikh",
      phone: "+91 99887 76655",
      address: "",
      notes: "Pays weekly, every Saturday.",
      createdAt: daysAgo(21),
    },
    {
      id: "c4",
      name: "StyleHub Retail",
      phone: "+91 90080 12345",
      address: "45, Brigade Road,\nAshok Nagar",
      notes: "Bulk orders around wedding and festival season.",
      createdAt: daysAgo(10),
    },
  ];

  const catalog: CatalogItem[] = [
    { id: "i1", name: "Cotton T-Shirt (Crew Neck)", unit: "piece", defaultPrice: 249 },
    { id: "i2", name: "Slim Fit Denim Jeans", unit: "piece", defaultPrice: 899 },
    { id: "i3", name: "Formal Shirt (Full Sleeve)", unit: "piece", defaultPrice: 649 },
    { id: "i4", name: "Polo T-Shirt", unit: "piece", defaultPrice: 399 },
    { id: "i5", name: "Cotton Socks", unit: "pair", defaultPrice: 49 },
    { id: "i6", name: "Hooded Sweatshirt", unit: "piece", defaultPrice: 799 },
    { id: "i7", name: "Track Pants", unit: "piece", defaultPrice: 449 },
    {
      id: "i8",
      name: "Denim Jacket (old stock)",
      unit: "piece",
      defaultPrice: 1450,
      archivedAt: daysAgo(5),
    },
  ];

  const snapshot = (c: Customer) => ({
    name: c.name,
    phone: c.phone,
    address: c.address,
  });

  const orders: Order[] = [
    {
      id: "o1",
      number: 1,
      customerId: "c1",
      customerSnapshot: snapshot(customers[0]),
      status: "completed",
      priced: true,
      notes: "",
      createdAt: daysAgo(6, 9),
      completedAt: daysAgo(5, 17),
      lines: [
        { id: uid(), itemName: "Cotton T-Shirt (Crew Neck)", catalogItemId: "i1", qty: 25, unit: "piece", unitPrice: 249, fulfilledAt: daysAgo(5, 16) },
        { id: uid(), itemName: "Cotton Socks", catalogItemId: "i5", qty: 40, unit: "pair", unitPrice: 49, fulfilledAt: daysAgo(5, 17) },
      ],
    },
    {
      id: "o2",
      number: 2,
      customerId: "c3",
      customerSnapshot: snapshot(customers[2]),
      status: "completed",
      priced: false,
      notes: "Picked up at the shop.",
      createdAt: daysAgo(3, 11),
      completedAt: daysAgo(2, 12),
      lines: [
        { id: uid(), itemName: "Polo T-Shirt", catalogItemId: "i4", qty: 6, unit: "piece", fulfilledAt: daysAgo(2, 12) },
        { id: uid(), itemName: "Canvas Belt", qty: 12, unit: "piece", fulfilledAt: daysAgo(2, 12) },
      ],
    },
    {
      id: "o3",
      number: 3,
      customerId: "c2",
      customerSnapshot: snapshot(customers[1]),
      status: "pending",
      priced: true,
      notes: "Deliver before 6pm.",
      createdAt: daysAgo(1, 10),
      lines: [
        { id: uid(), itemName: "Formal Shirt (Full Sleeve)", catalogItemId: "i3", qty: 12, unit: "piece", unitPrice: 649, fulfilledAt: daysAgo(0, 9) },
        { id: uid(), itemName: "Slim Fit Denim Jeans", catalogItemId: "i2", qty: 5, unit: "piece", unitPrice: 899 },
        { id: uid(), itemName: "Hooded Sweatshirt", catalogItemId: "i6", qty: 20, unit: "piece", unitPrice: 799 },
      ],
    },
    {
      id: "o4",
      number: 4,
      customerId: "c4",
      customerSnapshot: snapshot(customers[3]),
      status: "pending",
      priced: false,
      notes: "",
      createdAt: daysAgo(0, 9),
      lines: [
        { id: uid(), itemName: "Cotton T-Shirt (Crew Neck)", catalogItemId: "i1", qty: 50, unit: "piece" },
        { id: uid(), itemName: "Track Pants", catalogItemId: "i7", qty: 8, unit: "piece" },
        { id: uid(), itemName: "Garment Covers", qty: 100, unit: "piece" },
      ],
    },
    {
      id: "o5",
      number: 5,
      customerId: "c1",
      customerSnapshot: snapshot(customers[0]),
      status: "pending",
      priced: true,
      notes: "",
      createdAt: daysAgo(0, 11),
      lines: [
        { id: uid(), itemName: "Slim Fit Denim Jeans", catalogItemId: "i2", qty: 2, unit: "piece", unitPrice: 899 },
        { id: uid(), itemName: "Cotton Socks", catalogItemId: "i5", qty: 5, unit: "pair", unitPrice: 49 },
      ],
    },
  ];

  return {
    signedIn: true,
    ownerEmail: email,
    business: null,
    customers,
    catalog,
    orders,
    orderCounter: 5,
  };
}

interface StoreApi {
  state: AppState;
  signIn: (email: string) => void;
  signOut: () => void;
  saveBusiness: (b: Business) => void;
  addCustomer: (c: Omit<Customer, "id" | "createdAt">) => Customer;
  updateCustomer: (id: string, c: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addCatalogItem: (i: Omit<CatalogItem, "id">) => CatalogItem;
  updateCatalogItem: (id: string, i: Partial<CatalogItem>) => void;
  createOrder: (input: OrderInput) => Order;
  updateOrder: (id: string, input: OrderInput) => void;
  deleteOrder: (id: string) => void;
  toggleLine: (orderId: string, lineId: string) => void;
  reopenOrder: (id: string) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreApi | null>(null);

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...emptyState, ...(JSON.parse(raw) as AppState) };
  } catch {
    // corrupted storage — start fresh
  }
  return emptyState;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const signIn = useCallback((email: string) => {
    setState((s) =>
      s.ownerEmail === email && s.customers.length > 0
        ? { ...s, signedIn: true }
        : seedState(email),
    );
  }, []);

  const signOut = useCallback(() => {
    setState((s) => ({ ...s, signedIn: false }));
  }, []);

  const saveBusiness = useCallback((b: Business) => {
    setState((s) => ({ ...s, business: b }));
  }, []);

  const addCustomer = useCallback(
    (c: Omit<Customer, "id" | "createdAt">): Customer => {
      const customer: Customer = {
        ...c,
        id: uid(),
        createdAt: new Date().toISOString(),
      };
      setState((s) => ({ ...s, customers: [customer, ...s.customers] }));
      return customer;
    },
    [],
  );

  const updateCustomer = useCallback((id: string, patch: Partial<Customer>) => {
    setState((s) => ({
      ...s,
      customers: s.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      customers: s.customers.map((c) =>
        c.id === id ? { ...c, deletedAt: new Date().toISOString() } : c,
      ),
    }));
  }, []);

  const addCatalogItem = useCallback(
    (i: Omit<CatalogItem, "id">): CatalogItem => {
      const item: CatalogItem = { ...i, id: uid() };
      setState((s) => ({ ...s, catalog: [item, ...s.catalog] }));
      return item;
    },
    [],
  );

  const updateCatalogItem = useCallback(
    (id: string, patch: Partial<CatalogItem>) => {
      setState((s) => ({
        ...s,
        catalog: s.catalog.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      }));
    },
    [],
  );

  const createOrder = useCallback((input: OrderInput): Order => {
    let created: Order | null = null;
    setState((s) => {
      const customer = s.customers.find((c) => c.id === input.customerId);
      const number = s.orderCounter + 1;
      const order: Order = {
        id: uid(),
        number,
        customerId: input.customerId,
        customerSnapshot: {
          name: customer?.name ?? "Unknown",
          phone: customer?.phone ?? "",
          address: customer?.address ?? "",
        },
        status: "pending",
        priced: input.priced,
        notes: input.notes,
        lines: input.lines.map((l) => ({ ...l, id: uid() })),
        createdAt: new Date().toISOString(),
      };
      created = order;
      return { ...s, orders: [order, ...s.orders], orderCounter: number };
    });
    return created!;
  }, []);

  const updateOrder = useCallback((id: string, input: OrderInput) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => {
        if (o.id !== id) return o;
        const customer = s.customers.find((c) => c.id === input.customerId);
        return {
          ...o,
          customerId: input.customerId,
          customerSnapshot: customer
            ? { name: customer.name, phone: customer.phone, address: customer.address }
            : o.customerSnapshot,
          priced: input.priced,
          notes: input.notes,
          lines: input.lines.map((l) => ({ ...l, id: uid() })),
        };
      }),
    }));
  }, []);

  const deleteOrder = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, deletedAt: new Date().toISOString() } : o,
      ),
    }));
  }, []);

  const toggleLine = useCallback((orderId: string, lineId: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) => {
        if (o.id !== orderId) return o;
        const lines = o.lines.map((l) =>
          l.id === lineId
            ? {
                ...l,
                fulfilledAt: l.fulfilledAt ? undefined : new Date().toISOString(),
              }
            : l,
        );
        const allDone = lines.every((l) => l.fulfilledAt);
        return {
          ...o,
          lines,
          status: allDone ? "completed" : "pending",
          completedAt: allDone ? new Date().toISOString() : undefined,
        };
      }),
    }));
  }, []);

  const reopenOrder = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, status: "pending", completedAt: undefined } : o,
      ),
    }));
  }, []);

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(emptyState);
  }, []);

  const api: StoreApi = {
    state,
    signIn,
    signOut,
    saveBusiness,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addCatalogItem,
    updateCatalogItem,
    createOrder,
    updateOrder,
    deleteOrder,
    toggleLine,
    reopenOrder,
    resetDemo,
  };

  return <StoreContext value={api}>{children}</StoreContext>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
