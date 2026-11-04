import type { ComponentType } from "react";
import { Overview } from "./Overview";
import { Analytics } from "./Analytics";
import { Reports } from "./Reports";
import { AllServices } from "./AllServices";

/** Functional pages keyed by registry path; other destinations fall back to ModulePage. */
export const functionalPages: Record<string, ComponentType> = {
  "/": Overview,
  "/dashboard/analytics": Analytics,
  "/dashboard/reports": Reports,
  "/services/all": AllServices,
};
