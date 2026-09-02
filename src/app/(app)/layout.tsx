import type { ReactNode } from "react";
import { MockAppProvider } from "@/components/layout/MockAppProvider";
import { AppChrome } from "@/components/layout/AppChrome";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return (
    <MockAppProvider>
      <AppChrome>{children}</AppChrome>
    </MockAppProvider>
  );
}
