import { BookOpen, Bookmark, Home, LogOut, Upload, User, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { useAuth } from "../../lib/auth-context";

const NAV_ITEMS = [
  { icon: Home, label: "Inicio", path: "/app" },
  { icon: BookOpen, label: "Carreras", path: "/app/courses" },
  { icon: Upload, label: "Subir", path: "/app/upload" },
  { icon: Bookmark, label: "Guardados", path: "/app/saved" },
  { icon: User, label: "Perfil", path: "/app/profile" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => {
    if (path === "/app") return location.pathname === "/app";
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Sesión cerrada");
      navigate("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cerrar sesión");
    }
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-[#E0E0E0] flex-col transition-transform lg:translate-x-0 lg:flex ${
          mobileOpen ? "flex translate-x-0" : "hidden -translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-[#E0E0E0] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-[#0066CC] rounded-md flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl text-[#1a1a1a]">Vaultio</span>
          </Link>
          {mobileOpen && (
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={onCloseMobile}
              className="lg:hidden p-1 rounded-md text-[#666666] hover:bg-[#F5F7FA]"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav aria-label="Navegación principal" className="flex-1 p-4">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onCloseMobile}
                  aria-current={isActive(item.path) ? "page" : undefined}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2 ${
                    isActive(item.path)
                      ? "bg-[#E3F2FD] text-[#0066CC] font-medium"
                      : "text-[#666666] hover:bg-[#F5F7FA]"
                  }`}
                >
                  <item.icon aria-hidden="true" className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-[#E0E0E0]">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2.5 rounded-md text-[#666666] hover:bg-[#F5F7FA] w-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2"
          >
            <LogOut aria-hidden="true" className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
