import type { ReactNode } from "react";
import { AppChrome } from "@/components/layout/AppChrome";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppChrome>{children}</AppChrome>;
}
