"use client";

import { useState, useTransition } from "react";
import { addStaffMemberAction } from "@/app/actions/staff";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

export function StaffForm({
  businessId,
  staff,
  variant = "default",
}: {
  businessId: string;
  staff: { id: string; name: string; role: string; slotCapacity: number }[];
  variant?: "default" | "fitness";
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState(variant === "fitness" ? "trainer" : "stylist");
  const [slotCapacity, setSlotCapacity] = useState(1);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-6 space-y-6">
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          startTransition(async () => {
            const r = await addStaffMemberAction(businessId, name, role, slotCapacity);
            if (r.success) {
              setName("");
              setMessage(variant === "fitness" ? "Trainer added" : "Staff member added");
            } else {
              setMessage(r.error ?? "");
            }
          });
        }}
      >
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select className="w-full rounded-lg border px-3 py-2 text-sm" value={role} onChange={(e) => setRole(e.target.value)}>
          {variant === "fitness" ? (
            <>
              <option value="trainer">Trainer</option>
              <option value="yoga_instructor">Yoga instructor</option>
              <option value="pt">Personal trainer</option>
              <option value="reception">Reception</option>
            </>
          ) : (
            <>
              <option value="stylist">Stylist</option>
              <option value="therapist">Therapist</option>
              <option value="reception">Reception</option>
            </>
          )}
        </select>
        <input
          className="w-full rounded-lg border px-3 py-2 text-sm"
          type="number"
          min={1}
          max={20}
          value={slotCapacity}
          onChange={(e) => setSlotCapacity(Number(e.target.value))}
          placeholder="Slot capacity"
        />
        <Button type="submit" disabled={isPending || !name.trim()}>
          Add staff
        </Button>
      </form>

      {message && <p className="text-sm text-slate-700">{message}</p>}

      <div>
        <h2 className="font-semibold">Team ({staff.length})</h2>
        {staff.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No staff yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {staff.map((s) => (
              <li key={s.id} className="rounded-lg border bg-white px-3 py-2">
                <span className="font-medium">{s.name}</span>
                <span className="ml-2 text-slate-500">
                  {s.role} · {s.slotCapacity} slot{s.slotCapacity === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}