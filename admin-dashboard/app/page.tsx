import { AuthGuard } from "@/components/auth-guard";
import { DashboardShell } from "@/components/dashboard-shell";

export default function HomePage() {
  return (
    <AuthGuard>
      <DashboardShell />
    </AuthGuard>
  );
}
