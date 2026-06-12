import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useStore } from "./store";
import { SignInPage } from "./pages/SignIn";
import { OnboardingPage } from "./pages/Onboarding";
import { OrdersPage } from "./pages/Orders";
import { OrderDetailPage } from "./pages/OrderDetail";
import { OrderFormPage } from "./pages/OrderForm";
import {
  CustomerDetailPage,
  CustomerFormPage,
  CustomersPage,
} from "./pages/Customers";
import { CatalogFormPage, CatalogPage } from "./pages/Catalog";
import { SettingsPage } from "./pages/Settings";

function RequireAuth({ children }: { children: ReactNode }) {
  const { state } = useStore();
  if (!state.signedIn) return <Navigate replace to="/signin" />;
  if (!state.business) return <Navigate replace to="/onboarding" />;
  return children;
}

export default function App() {
  const { state } = useStore();

  return (
    <Routes>
      <Route
        element={state.signedIn ? <Navigate replace to="/" /> : <SignInPage />}
        path="/signin"
      />
      <Route
        element={
          !state.signedIn ? (
            <Navigate replace to="/signin" />
          ) : state.business ? (
            <Navigate replace to="/orders" />
          ) : (
            <OnboardingPage />
          )
        }
        path="/onboarding"
      />
      <Route element={<RequireAuth><OrdersPage /></RequireAuth>} path="/orders" />
      <Route element={<RequireAuth><OrderFormPage /></RequireAuth>} path="/orders/new" />
      <Route element={<RequireAuth><OrderDetailPage /></RequireAuth>} path="/orders/:id" />
      <Route element={<RequireAuth><OrderFormPage /></RequireAuth>} path="/orders/:id/edit" />
      <Route element={<RequireAuth><CustomersPage /></RequireAuth>} path="/customers" />
      <Route element={<RequireAuth><CustomerFormPage /></RequireAuth>} path="/customers/new" />
      <Route element={<RequireAuth><CustomerDetailPage /></RequireAuth>} path="/customers/:id" />
      <Route element={<RequireAuth><CustomerFormPage /></RequireAuth>} path="/customers/:id/edit" />
      <Route element={<RequireAuth><CatalogPage /></RequireAuth>} path="/catalog" />
      <Route element={<RequireAuth><CatalogFormPage /></RequireAuth>} path="/catalog/new" />
      <Route element={<RequireAuth><CatalogFormPage /></RequireAuth>} path="/catalog/:id/edit" />
      <Route element={<RequireAuth><SettingsPage /></RequireAuth>} path="/settings" />
      <Route element={<Navigate replace to="/orders" />} path="*" />
    </Routes>
  );
}
