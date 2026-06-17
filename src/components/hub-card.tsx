import { Box, Code, Cpu, Server, Smartphone, Zap } from "lucide-react";
import Link from "next/link";
import type { ComponentType } from "react";
import { type Hub, hubHref, type HubIcon } from "@/lib/hubs";

const ICONS: Record<HubIcon, ComponentType<{ className?: string }>> = {
  server: Server,
  code: Code,
  cpu: Cpu,
  box: Box,
  smartphone: Smartphone,
  zap: Zap,
};

/** Card de navegação principal "Comece por aqui". */
export function HubCard({ hub }: { hub: Hub }) {
  const Icon = ICONS[hub.icon];
  return (
    <Link
      href={hubHref(hub)}
      className="group flex flex-col gap-3 rounded-card border border-border bg-card p-5 transition-colors hover:border-accent/50"
    >
      <span className="inline-flex size-10 items-center justify-center rounded-lg border border-border bg-secondary text-accent transition-colors group-hover:border-accent/50">
        <Icon className="size-5" />
      </span>
      <div>
        <h3 className="font-display text-base font-bold text-foreground">
          {hub.title}
        </h3>
        <p className="mt-1 text-sm leading-snug text-muted-foreground">
          {hub.description}
        </p>
      </div>
    </Link>
  );
}
