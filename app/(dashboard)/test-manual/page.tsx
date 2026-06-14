import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TestManualClient from "./test-manual-client";

export default async function TestManualPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") redirect("/");

  return <TestManualClient />;
}
