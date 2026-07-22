import { Navigate, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useAdminAuth } from "@/lib/auth/admin-auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Shake N Flex" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const { user } = useAdminAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLogin = pathname === "/admin" || pathname === "/admin/";

  if (isLogin) {
    if (user) return <Navigate to="/admin/dashboard" replace />;
    return <Outlet />;
  }
  if (!user) return <Navigate to="/admin" replace />;
  return <Outlet />;
}