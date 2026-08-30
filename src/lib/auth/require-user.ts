import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "./session";

/** Use at the top of a protected server component/page. Redirects if not signed in. */
export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }
  return userId;
}
