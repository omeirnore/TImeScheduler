import { requireUserId } from "@/lib/auth/require-user";
import { db } from "@/lib/db";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const userId = await requireUserId();
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });

  return <AppShell userEmail={user.email}>{children}</AppShell>;
}
