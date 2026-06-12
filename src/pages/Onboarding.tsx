import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, toast } from "@heroui/react";
import { Store } from "lucide-react";
import { FormField } from "../components/FormField";
import { useStore } from "../store";

export function OnboardingPage() {
  const { state, saveBusiness } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(state.ownerEmail);
  const [pan, setPan] = useState("");
  const [gst, setGst] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.danger("Business name is required");
      return;
    }
    if (!phone.trim()) {
      toast.danger("Contact phone is required");
      return;
    }
    saveBusiness({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      pan: pan.trim(),
      gst: gst.trim(),
    });
    toast.success("You're all set!");
    navigate("/orders", { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-background px-4 py-8">
      <div className="mb-6 flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
          <Store aria-hidden className="size-7" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            Set up your business
          </h1>
          <p className="text-sm text-muted">
            This appears on every order you share. You can edit it later in
            Settings.
          </p>
        </div>
      </div>

      <form className="flex flex-col gap-4" onSubmit={submit}>
        <FormField
          isRequired
          label="Business name"
          placeholder="e.g. Sri Venkateshwara Traders"
          value={name}
          onChange={setName}
        />
        <FormField
          label="Address"
          multiline
          placeholder="Shop address"
          value={address}
          onChange={setAddress}
        />
        <FormField
          isRequired
          description="Used as your WhatsApp number on shared orders."
          inputMode="tel"
          label="Contact phone"
          placeholder="+91 ..."
          type="tel"
          value={phone}
          onChange={setPhone}
        />
        <FormField
          label="Contact email"
          placeholder="you@business.in"
          type="email"
          value={email}
          onChange={setEmail}
        />
        <FormField
          description="Optional — prints on shared PDFs if filled in."
          label="PAN number"
          placeholder="ABCDE1234F"
          value={pan}
          onChange={setPan}
        />
        <FormField
          description="Optional — prints on shared PDFs if filled in."
          label="GST number"
          placeholder="29ABCDE1234F1Z5"
          value={gst}
          onChange={setGst}
        />
        <Button fullWidth className="mt-2" size="lg" type="submit">
          Save & continue
        </Button>
      </form>
    </div>
  );
}
