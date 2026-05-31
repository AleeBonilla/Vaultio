import { Menu, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { SearchBar } from "../ui/SearchBar";
import { useAuth } from "../../lib/auth-context";

interface TopNavProps {
  onOpenMobileMenu?: () => void;
}

export function TopNav({ onOpenMobileMenu }: TopNavProps) {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [search, setSearch] = useState("");

  const displayName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";
  const initials = profile
    ? `${profile.firstName?.[0] || ""}${profile.lastName?.[0] || ""}`.toUpperCase() ||
      profile.email?.[0]?.toUpperCase() ||
      ""
    : "";

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = search.trim();
    if (!trimmed) return;
    navigate(`/app/resources?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-20 h-16 border-b border-blue-100/80 bg-white/80 backdrop-blur-xl lg:left-64">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={onOpenMobileMenu}
          className="rounded-md p-2 text-slate-600 hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 lg:hidden"
        >
          <Menu aria-hidden="true" className="w-5 h-5" />
        </button>

        <form role="search" aria-label="Buscar recursos" onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <SearchBar
            label="Buscar recursos"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar cursos, recursos, temas..."
          />
        </form>

        <div className="flex items-center gap-2">
          <Link
            to="/app/profile"
            className="flex items-center gap-2 rounded-full px-3 py-2 transition-colors hover:bg-blue-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Abrir perfil de usuario"
          >
            {profile?.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt=""
                className="h-8 w-8 rounded-full object-cover shadow-md shadow-blue-900/10"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-sm font-semibold text-white shadow-md shadow-blue-600/20">
                {initials || <User aria-hidden="true" className="w-4 h-4" />}
              </div>
            )}
            <span className="hidden text-sm font-medium text-slate-900 sm:inline">
              {displayName || "Mi perfil"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
