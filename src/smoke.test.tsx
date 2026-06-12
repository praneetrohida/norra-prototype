/**
 * Click-through smoke test: drives the real app through sign-in, onboarding,
 * order fulfilment and order creation, in jsdom.
 */
import { beforeEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { MemoryRouter } from "react-router-dom";
import { Toast } from "@heroui/react";
import App from "./App";
import { StoreProvider } from "./store";

// jsdom lacks a few browser APIs HeroUI relies on
beforeEach(() => {
  cleanup();
  localStorage.clear();
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as typeof window.matchMedia;
  window.HTMLElement.prototype.scrollIntoView ??= vi.fn();
  window.Element.prototype.getAnimations ??= () => [];
  window.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

function renderApp() {
  return render(
    <StrictMode>
      <MemoryRouter>
        <StoreProvider>
          <App />
          <Toast.Provider />
        </StoreProvider>
      </MemoryRouter>
    </StrictMode>,
  );
}

async function signInAndOnboard(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/email/i), "owner@example.in");
  await user.type(screen.getByLabelText(/password/i), "secret");
  await user.click(screen.getByRole("button", { name: /^sign in$/i }));

  await screen.findByText(/set up your business/i);
  await user.type(screen.getByLabelText(/business name/i), "Demo Traders");
  await user.type(screen.getByLabelText(/contact phone/i), "+91 90000 00000");
  await user.click(screen.getByRole("button", { name: /save & continue/i }));

  await screen.findByRole("heading", { name: /^orders$/i });
}

test("sign in, onboard, browse orders and complete fulfilment", async () => {
  const user = userEvent.setup();
  renderApp();

  expect(screen.getByRole("heading", { name: /order tracker/i })).toBeTruthy();
  await signInAndOnboard(user);

  // seeded pending orders are listed
  expect(screen.getByText("Sunita General Store")).toBeTruthy();
  expect(screen.getByText("#000003")).toBeTruthy();

  // open order #000005 (2 unfulfilled lines) and tick both
  await user.click(screen.getByText("#000005"));
  await screen.findByRole("heading", { name: /order #000005/i });
  expect(screen.getByText(/0 of 2 fulfilled/i)).toBeTruthy();

  const checkboxes = screen.getAllByRole("checkbox");
  expect(checkboxes.length).toBe(2);
  await user.click(checkboxes[0]);
  await screen.findByText(/1 of 2 fulfilled/i);
  await user.click(checkboxes[1]);

  // auto-completes with a toast and becomes read-only (reopen available)
  await screen.findAllByText(/marked as completed/i);
  expect(screen.getByRole("button", { name: /reopen order/i })).toBeTruthy();
}, 30000);

test("create a priced order from catalog and freeform items", async () => {
  const user = userEvent.setup();
  renderApp();
  await signInAndOnboard(user);

  await user.click(screen.getByRole("button", { name: /new order/i }));
  await screen.findByRole("heading", { name: /new order/i });

  // pick a customer
  await user.click(screen.getByRole("button", { name: /select customer/i }));
  const dialog = await screen.findByRole("dialog");
  await user.click(within(dialog).getByText("Ramesh Kumar"));

  // add a catalog item via suggestion
  await user.type(screen.getByLabelText(/add item/i), "toor");
  await user.click(await screen.findByText("Toor Dal"));
  // add a freeform item
  await user.type(screen.getByLabelText(/add item/i), "Banana Leaves");
  await user.click(await screen.findByText(/add "Banana Leaves" as a new item/i));

  // include prices
  await user.click(screen.getByRole("switch"));
  expect(screen.getByText(/subtotal/i)).toBeTruthy();

  await user.click(screen.getByRole("button", { name: /save order/i }));

  // lands on the new order's detail screen
  await screen.findByRole("heading", { name: /order #000006/i });
  expect(screen.getByText("Toor Dal")).toBeTruthy();
  expect(screen.getByText("Banana Leaves")).toBeTruthy();
  expect(screen.getByText(/order total/i)).toBeTruthy();
}, 30000);

test("customers and catalog CRUD screens render", async () => {
  const user = userEvent.setup();
  renderApp();
  await signInAndOnboard(user);

  await user.click(screen.getByRole("link", { name: /customers/i }));
  await screen.findByRole("heading", { name: /^customers$/i });
  await user.click(screen.getByText("Lakshmi Caterers"));
  await screen.findByText(/bulk orders around festival season/i);
  await user.click(screen.getByRole("button", { name: /go back/i }));
  await screen.findByRole("heading", { name: /^customers$/i });

  await user.click(screen.getByRole("link", { name: /catalog/i }));
  await screen.findByRole("heading", { name: /^catalog$/i });
  expect(screen.getByText("Basmati Rice")).toBeTruthy();
  expect(screen.getByText(/archived \(1\)/i)).toBeTruthy();

  await user.click(screen.getByRole("link", { name: /settings/i }));
  await screen.findByRole("heading", { name: /^settings$/i });
  expect(screen.getByText(/owner@example.in/i)).toBeTruthy();
}, 30000);
