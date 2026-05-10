import { auth } from "@/auth"
import Sidebar from "@/components/layout/Sidebar"
import TopNav from "@/components/layout/TopNav"
import BottomNav from "@/components/layout/BottomNav"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#071326] text-slate-200">
      <div className="hidden md:block">
        <Sidebar userRole={session.user.role} />
      </div>
      <div className="flex-1 flex flex-col min-w-0 pb-[60px] md:pb-0">
        <TopNav userName={session.user.name || undefined} userRole={session.user.role} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 relative styled-scrollbar">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
