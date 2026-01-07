import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, PenSquare, User } from 'lucide-react';

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-foreground">
              The Blog
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/admin" 
                  className="btn-ghost flex items-center gap-2"
                >
                  <PenSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <div className="flex items-center gap-3 pl-2 border-l border-border">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {user?.username}
                  </span>
                  <button
                    onClick={logout}
                    className="btn-ghost flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="btn-primary">
                Admin Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
