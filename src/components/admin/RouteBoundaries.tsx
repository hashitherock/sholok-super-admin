import { Link, useRouter, type ErrorComponentProps } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function AdminNotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl font-bold text-primary">404</p>
      <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">This address isn't part of Sholok Super Admin. Find a destination in the navigation or return to Overview.</p>
      <Button asChild className="mt-6"><Link to="/">Back to Overview</Link></Button>
    </section>
  );
}

export function AdminRouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold">This page didn't load</h1>
      <p className="mt-2 text-sm text-muted-foreground">Please try again or return to Overview.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={async () => { await router.invalidate(); reset(); }}>Try again</Button>
        <Button asChild variant="outline"><Link to="/">Go home</Link></Button>
      </div>
      {error instanceof Error && <span className="sr-only">Page loading error</span>}
    </section>
  );
}