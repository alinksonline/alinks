"use client";

import type { InputHTMLAttributes } from "react";
import { sanitizeTenDigitPhoneInput } from "@/core/utils/phone";
import { cn } from "@/core/utils/cn";

type TenDigitPhoneInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "maxLength"> & {
  value: string;
  onValueChange: (value: string) => void;
};

export function TenDigitPhoneInput({ value, onValueChange, className, id, ...props }: TenDigitPhoneInputProps) {
  return (
    <input
      id={id}
      type="tel"
      inputMode="numeric"
      autoComplete="tel-national"
      pattern="[6-9][0-9]{9}"
      maxLength={10}
      value={value}
      onChange={(e) => onValueChange(sanitizeTenDigitPhoneInput(e.target.value))}
      onPaste={(e) => {
        e.preventDefault();
        let pasted = sanitizeTenDigitPhoneInput(e.clipboardData.getData("text"));
        if (pasted.length > 10 && pasted.startsWith("91")) {
          pasted = pasted.slice(2);
        }
        onValueChange(pasted.slice(0, 10));
      }}
      className={cn("premium-input tabular-nums tracking-wide", className)}
      {...props}
    />
  );
}