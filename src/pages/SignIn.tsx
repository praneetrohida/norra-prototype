import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, toast } from "@heroui/react";
import { ClipboardList } from "lucide-react";
import { FormField } from "../components/FormField";
import { useStore } from "../store";

export function SignInPage() {
  const { signIn } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.danger("Enter your email and password");
      return;
    }
    signIn(email.trim());
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center bg-background px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <ClipboardList aria-hidden className="size-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Tracker</h1>
          <p className="text-sm text-muted">
            Take orders on-site, share on WhatsApp, tick them off.
          </p>
        </div>
      </div>

      <Card className="w-full">
        <Card.Content>
          <form className="flex flex-col gap-4 py-2" onSubmit={submit}>
            <FormField
              isRequired
              label="Email"
              placeholder="you@business.in"
              type="email"
              value={email}
              onChange={setEmail}
            />
            <FormField
              isRequired
              label="Password"
              placeholder={mode === "signup" ? "Choose a password" : "Your password"}
              type="password"
              value={password}
              onChange={setPassword}
            />
            <Button fullWidth size="lg" type="submit">
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
            {mode === "signin" ? (
              <Button
                fullWidth
                size="sm"
                variant="ghost"
                onPress={() => toast.info("Password reset link sent (prototype)")}
              >
                Forgot password?
              </Button>
            ) : null}
          </form>
        </Card.Content>
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        {mode === "signin" ? "New to Order Tracker?" : "Already have an account?"}{" "}
        <button
          type="button"
          className="min-h-11 font-medium text-link"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        >
          {mode === "signin" ? "Create an account" : "Sign in"}
        </button>
      </p>
      <p className="mt-2 text-center text-xs text-muted">
        Prototype — any email and password works.
      </p>
    </div>
  );
}
