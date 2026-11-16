
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileCheck2,
} from "lucide-react";

import DashboardSidebar, {
  type DashboardNavItem,
} from "../../../components/layout/DashboardSidebar";

import DashboardHeader from "../../../components/layout/DashboardHeader";
import { useAppSelector } from "../../../app/store/hooks";
import { useLogout } from "../../auth/hooks/useLogout";

const navigationItems: DashboardNavItem[] = [
  {
    label: "Overview",
    path: "/admin/dashboard",
    icon: <LayoutDashboard size={19} />,
  },
  {
    label: "Host Applications",
    path: "/admin/host-applications",
    icon: <FileCheck2 size={19} />,
  },
];

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Local credentials are cleared by the logout hook.
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        title="ADMIN MENU"
        subtitle="Administration workspace"
        items={navigationItems}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-[260px]">
        <DashboardHeader
          title="Admin Dashboard"
          userName={user?.fullName ?? "Admin"}
          userEmail={user?.email}
          onMenuClick={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className="mx-auto w-full max-w-[1600px] p-5 sm:p-7 lg:p-9">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
