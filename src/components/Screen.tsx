import type { ReactNode } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Button } from "@heroui/react";
import {
  ChevronLeft,
  ClipboardList,
  Package,
  Settings,
  Users,
} from "lucide-react";

const tabs = [
  { to: "/orders", label: "Orders", icon: ClipboardList },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/catalog", label: "Catalog", icon: Package },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-separator bg-surface pb-safe"
    >
      <div className="mx-auto flex max-w-md">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                isActive ? "text-accent" : "text-muted"
              }`
            }
          >
            <Icon aria-hidden className="size-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

interface ScreenProps {
  title: string;
  back?: boolean | string;
  action?: ReactNode;
  withNav?: boolean;
  children: ReactNode;
}

export function Screen({ title, back, action, withNav, children }: ScreenProps) {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-1 border-b border-separator bg-surface px-2">
        {back ? (
          <Button
            aria-label="Go back"
            isIconOnly
            size="sm"
            variant="ghost"
            onPress={() => {
              if (typeof back === "string") navigate(back);
              else navigate(-1);
            }}
          >
            <ChevronLeft aria-hidden className="size-5" />
          </Button>
        ) : null}
        <h1 className="min-w-0 flex-1 truncate px-1 text-lg font-semibold text-foreground">
          {title}
        </h1>
        {action}
      </header>
      <main className={`flex-1 px-4 py-4 ${withNav ? "pb-24" : "pb-8"}`}>
        {children}
      </main>
      {withNav ? <BottomNav /> : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Package;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-surface-secondary">
        <Icon aria-hidden className="size-7 text-muted" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      {description ? <p className="text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
