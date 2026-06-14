import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DevManualClient from "./dev-manual-client";

export default async function DevManualPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") redirect("/");
  return <DevManualClient />;
}
