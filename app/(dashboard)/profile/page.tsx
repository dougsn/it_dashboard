import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, username: true, role: true, totpEnabled: true, createdAt: true },
  });
  if (!user) redirect("/login");

  return <ProfileClient user={user} />;
}
