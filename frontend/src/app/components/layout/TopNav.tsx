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
    <header className="h-16 bg-white border-b border-[#E0E0E0] fixed top-0 left-0 right-0 z-20 lg:left-64">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <button
          type="button"
          aria-label="Abrir menú"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-md text-[#666666] hover:bg-[#F5F7FA]"
        >
          <Menu className="w-5 h-5" />
        </button>

        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
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
            className="flex items-center gap-2 px-3 py-2 hover:bg-[#F5F7FA] rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC] focus-visible:ring-offset-2"
            aria-label="Abrir perfil de usuario"
          >
            <div className="w-8 h-8 bg-[#0066CC] rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {initials || <User className="w-4 h-4" />}
            </div>
            <span className="hidden sm:inline text-sm font-medium text-[#1a1a1a]">
              {displayName || "Mi perfil"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
