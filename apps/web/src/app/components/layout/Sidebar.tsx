import { BookOpen, Bookmark, Home, LogOut, Upload, User, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { VaultioLogo } from "../ui/VaultioLogo";
import { useAuth } from "../../lib/auth-context";

const NAV_ITEMS = [
  { icon: Home, label: "Inicio", path: "/app", ariaLabel: "Ir al inicio del estudiante" },
  {
    icon: BookOpen,
    label: "Carreras y cursos",
    path: "/app/courses",
    ariaLabel: "Explorar carreras y cursos disponibles",
  },
  { icon: Upload, label: "Subir recurso", path: "/app/upload", ariaLabel: "Subir un recurso academico" },
  {
    icon: Bookmark,
    label: "Recursos guardados",
    path: "/app/saved",
    ariaLabel: "Ver mis recursos guardados",
  },
  { icon: User, label: "Mi perfil", path: "/app/profile", ariaLabel: "Ver y editar mi perfil de estudiante" },
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

  const focusMainContent = () => {
    window.setTimeout(() => {
      document.getElementById("main-content")?.focus();
    }, 0);
  };

  const handleNavigation = () => {
    onCloseMobile?.();
    focusMainContent();
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
          <Link
            to="/"
            aria-label="Volver a la pagina principal de Vaultio"
            className="flex items-center gap-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <VaultioLogo textClassName="text-2xl" iconClassName="h-9 w-9" />
          </Link>
          {mobileOpen && (
            <button
              type="button"
              ref={closeButtonRef}
              aria-label="Cerrar menú"
              onClick={onCloseMobile}
              className="rounded-md p-1 text-slate-600 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 lg:hidden"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav aria-label="Navegación principal" aria-describedby="main-navigation-hint" className="flex-1 p-4">
          <p id="main-navigation-hint" className="sr-only">
            Active una opcion con Enter para abrirla. Tambien puede presionar flecha derecha desde la
            navegacion para ir al contenido principal de la pantalla actual.
          </p>
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={handleNavigation}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      focusMainContent();
                    }
                  }}
                  aria-label={item.ariaLabel}
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
            aria-label="Cerrar sesion actual"
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
