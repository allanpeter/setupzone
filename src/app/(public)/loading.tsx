import { Container } from "@/components/section";

export default function Loading() {
  return (
    <Container className="py-16">
      <div className="mb-8 h-8 w-48 animate-pulse rounded-md bg-secondary" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-card border border-border bg-card"
          />
        ))}
      </div>
    </Container>
  );
}
