import { Input, Label, TextArea, TextField } from "@heroui/react";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password" | "tel";
  inputMode?: "text" | "email" | "tel" | "decimal" | "numeric";
  isRequired?: boolean;
  multiline?: boolean;
  description?: string;
}

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode,
  isRequired,
  multiline,
  description,
}: FormFieldProps) {
  return (
    <TextField
      fullWidth
      isRequired={isRequired}
      type={multiline ? undefined : type}
      value={value}
      onChange={onChange}
    >
      <Label>{label}</Label>
      {multiline ? (
        <TextArea placeholder={placeholder} rows={3} />
      ) : (
        <Input inputMode={inputMode} placeholder={placeholder} />
      )}
      {description ? (
        <p className="mt-1 text-xs text-muted">{description}</p>
      ) : null}
    </TextField>
  );
}
