import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = (session.user as { id?: string }).id;
  const username = session.user.name;

  const user = await db.user.findUnique({
    where: userId ? { id: userId } : { username: username ?? "" },
    select: { id: true, username: true, role: true, totpEnabled: true, createdAt: true },
  });
  if (!user) redirect("/login");

  return <ProfileClient user={user} />;
}
