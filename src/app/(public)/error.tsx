"use client";

import { useEffect } from "react";
import { Container } from "@/components/section";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="t-eyebrow mb-4">erro</p>
      <h1 className="t-display-md mb-3">Algo deu ruim</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        Tivemos um problema ao carregar esta página. Tente novamente.
      </p>
      <Button variant="brand" nativeButton onClick={reset}>
        Tentar de novo
      </Button>
    </Container>
  );
}
