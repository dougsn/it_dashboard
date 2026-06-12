import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SystemClient } from "./system-client";

export default async function SystemPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") redirect("/");

  return <SystemClient />;
}
