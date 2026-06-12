import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import UsersClient from "./users-client";

export default async function UsersPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (role !== "ADMIN") redirect("/");
  return <UsersClient />;
}
