import { AlertTriangle, FlaskConical } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { resetToSample, useAdminStore } from "@/lib/admin-store";

export function DataNotice() {
  const { loadError, saveError } = useAdminStore();
  return (
    <div className="space-y-3">
      {(loadError || saveError) && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>{loadError ? "Saved data couldn't be loaded" : "Change not saved"}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>{loadError ?? saveError} {loadError && "Sample records are shown instead."}</span>
            {loadError && <Button size="sm" variant="outline" onClick={resetToSample}>Reset to sample records</Button>}
          </AlertDescription>
        </Alert>
      )}
      <p className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <FlaskConical className="size-4 shrink-0 text-primary" aria-hidden />
        Fictional sample records stored only in this browser. Not live data; nothing is sent to a server.
      </p>
    </div>
  );
}

export function PageHead({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{children}</div>;
}
