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

  const userRole = (session.user as { role?: string })?.role ?? "VIEWER";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={session.user?.name ?? ""} userRole={userRole} />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
