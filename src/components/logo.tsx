import Link from "next/link";
import { cn } from "@/lib/utils";

/** SetupZone wordmark + cube mark (green/gold), ported from the prototype SVG. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="SetupZone — início"
      className={cn(
        "inline-flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-foreground",
        className,
      )}
    >
      <span className="grid size-8 place-items-center rounded-sticker bg-foreground/[0.04] ring-1 ring-border">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
          <path
            d="M4 9.5 12 4l8 5.5v9L12 21l-8-5.5v-9Z"
            stroke="#0FA958"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="m8 11 4 2.5L16 11"
            stroke="#F5C518"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span>
        Setup<span className="text-primary">Zone</span>
      </span>
    </Link>
  );
}
