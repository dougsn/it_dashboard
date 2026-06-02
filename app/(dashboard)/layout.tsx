import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={session.user?.name ?? ""} />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-7">{children}</div>
      </main>
    </div>
  );
}
