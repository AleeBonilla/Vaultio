import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "./auth-context";

export function RequireAuth({ requireCompleteProfile = true }: { requireCompleteProfile?: boolean }) {
  const { loading, firebaseUser, profile, configError } = useAuth();
  const location = useLocation();

  if (configError) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h1 className="text-lg font-semibold mb-2">Configuración incompleta</h1>
          <p className="text-sm leading-relaxed">{configError}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-[#666666]">Cargando sesión...</div>
      </div>
    );
  }

  if (!firebaseUser || !profile) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireCompleteProfile && profile.careerIds.length === 0) {
    return <Navigate to="/register" replace />;
  }

  return <Outlet />;
}
