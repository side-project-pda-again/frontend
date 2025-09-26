import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUserStore } from "@stores/userStore";

export default function ProtectedRoute() {
  const location = useLocation();
  const hydrated = useUserStore((s) => s.hydrated);
  const user = useUserStore((s) => s.user);

  if (!hydrated) return <div style={{ padding: 24 }}>Loading…</div>; // rehydrate 끝날 때까지 대기
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
