"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

/** Confirm + invoke a server action that deletes by id. */
export function DeleteButton({
  id,
  action,
  label = "Excluir",
}: {
  id: string;
  action: (id: string) => Promise<void>;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="destructive"
      size="sm"
      nativeButton
      disabled={pending}
      onClick={() => {
        if (!confirm("Tem certeza? Esta ação não pode ser desfeita.")) return;
        startTransition(() => action(id));
      }}
    >
      <Trash2 className="size-3.5" />
      {label}
    </Button>
  );
}
