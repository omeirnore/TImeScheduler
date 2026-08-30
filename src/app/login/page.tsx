import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const userId = await getCurrentUserId();
  if (userId) {
    redirect("/dashboard");
  }

  const existingUser = await db.user.findFirst();
  if (!existingUser) {
    redirect("/setup");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to see what today looks like.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
