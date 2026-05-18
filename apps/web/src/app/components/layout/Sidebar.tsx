import { BookOpen, Bookmark, Home, LogOut, Upload, User, X } from "lucide-react";
import { useEffect, useRef } from "react";
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
  const drawerRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseMobile?.();
        return;
      }
      if (event.key !== "Tab") return;

      const drawer = drawerRef.current;
      if (!drawer) return;
      const focusable = Array.from(
        drawer.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onCloseMobile]);

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
          className="fixed inset-0 z-30 bg-black/40 lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={onCloseMobile}
        />
      )}

      <aside
        ref={drawerRef}
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen ? "true" : undefined}
        aria-label={mobileOpen ? "Menu principal" : undefined}
        className={`fixed left-0 top-0 z-40 h-screen w-64 flex-col border-r border-blue-100/80 bg-white/85 backdrop-blur-xl transition-transform lg:flex lg:translate-x-0 ${
          mobileOpen ? "flex translate-x-0" : "hidden -translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-blue-100/80 p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-600/20">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tighter text-slate-900 lowercase">vaultio</span>
          </Link>
          {mobileOpen && (
            <button
              type="button"
              ref={closeButtonRef}
              aria-label="Cerrar menú"
              onClick={onCloseMobile}
              className="rounded-md p-1 text-slate-600 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 lg:hidden"
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
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    isActive(item.path)
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-600 hover:bg-blue-50/70 hover:text-slate-900"
                  }`}
                >
                  <item.icon aria-hidden="true" className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-blue-100/80 p-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-slate-600 transition-colors hover:bg-blue-50/70 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <LogOut aria-hidden="true" className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
