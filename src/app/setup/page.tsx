import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { SetupForm } from "./setup-form";

// Whether a user already exists is mutable DB state, so this page must never
// be statically prerendered at build time.
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const existingUser = await db.user.findFirst();
  if (existingUser) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Set up TimeScheduler
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This creates the one account this app will ever have. Choose
            credentials you&apos;ll remember.
          </p>
        </div>
        <SetupForm />
      </div>
    </main>
  );
}
