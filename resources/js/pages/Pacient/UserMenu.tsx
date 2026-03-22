import { useState, useRef, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { logout } from '@/routes';
import { Link } from '@inertiajs/react';
export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { auth } = usePage<SharedData>().props;
  console.log('auth completo:', JSON.stringify(auth));
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewProfile = () => {
    console.log('Ver perfil');
    setIsOpen(false);
    // Aquí puedes agregar la navegación al perfil
  };

  const handleLogout = () => {
    console.log('Cerrar sesión');
    setIsOpen(false);
    // Aquí puedes agregar la lógica de cerrar sesión
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md hover:shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
      >
        <User className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          onMouseLeave={() => setIsOpen(false)}
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-900">{auth.user.name}</p>
            <p className="text-xs text-gray-500 truncate">{auth.user.email}</p>
          </div>

          {/* Menu Items */}
          <button
            onClick={handleViewProfile}
            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center gap-3 cursor-pointer"
          > 
            <User className="w-4 h-4" />
            Ver perfil
          </button>

          <Link
            href={logout()}
            as="button"
            onClick={handleLogout}
            data-test="logout-button"
            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Link>
        </div>
      )}
    </div>
  );
}
