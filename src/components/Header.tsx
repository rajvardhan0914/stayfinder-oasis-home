import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/favorites";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Heart, Calendar, UserCircle, HelpCircle, Sun, Moon, Home, Menu, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import api from "@/lib/api";
import { useMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";

const NavLink = ({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) => (
  <Link to={to} onClick={onClick}>
    {children}
  </Link>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const getAvatarUrl = (avatarPath: string) => {
  if (!avatarPath) return '';
  if (avatarPath.startsWith('http')) return avatarPath;
  return `${API_URL}${avatarPath.startsWith('/') ? '' : '/'}${avatarPath}`;
};

export const Header = () => {
  const { user, logout } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [hasProperties, setHasProperties] = useState(false);
  const isMobile = useMobile();
  const { t } = useTranslation();

  useEffect(() => {
    const checkUserProperties = async () => {
      if (!user) {
        setHasProperties(false);
        return;
      }
      try {
        const response = await api.get('/users/my-properties');
        setHasProperties(response.data && response.data.length > 0);
      } catch (error) {
        console.error('Error checking user properties:', error);
        setHasProperties(false);
      }
    };
    checkUserProperties();
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const renderNavLinks = (onLinkClick?: () => void) => (
    <>
      {user ? (
        <>
          <NavLink to="/bookings" onClick={onLinkClick}>
            <Button variant="ghost" className="w-full justify-start gap-2 h-9 sm:h-10 md:h-11 text-sm sm:text-base hover:border hover:border-border">
              <Calendar className="h-4 w-4" /> {t('bookings')}
            </Button>
          </NavLink>
          <NavLink to="/favorites" onClick={onLinkClick}>
            <Button variant="ghost" className="w-full justify-start gap-2 relative h-9 sm:h-10 md:h-11 text-sm sm:text-base hover:border hover:border-border">
              <Heart className="h-4 w-4" /> {t('favorites')}
              {favorites.length > 0 && !isMobile && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Button>
          </NavLink>
        </>
      ) : (
        <>
          <NavLink to="/host-dashboard" onClick={onLinkClick}>
            <Button variant="outline" className="w-full justify-start gap-2 h-9 sm:h-10 md:h-11 text-sm sm:text-base">
              <Home className="h-4 w-4" /> {t('becomeAHost')}
            </Button>
          </NavLink>
          <NavLink to="/login" onClick={onLinkClick}>
            <Button variant="ghost" className="w-full justify-start h-9 sm:h-10 md:h-11 text-sm sm:text-base hover:border hover:border-border">{t('login')}</Button>
          </NavLink>
          <NavLink to="/register" onClick={onLinkClick}>
            <Button className="w-full justify-start btn-primary h-9 sm:h-10 md:h-11 text-sm sm:text-base">{t('signUp')}</Button>
          </NavLink>
        </>
      )}
    </>
  );

  const renderDesktopNav = () => (
    <nav className="flex items-center space-x-1 sm:space-x-2">
      {user ? (
        <>
          <NavLink to="/bookings">
            <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">{t('bookings')}</span>
            </Button>
          </NavLink>
          <NavLink to="/favorites">
            <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 relative h-8 sm:h-9 text-xs sm:text-sm">
              <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">{t('favorites')}</span>
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Button>
          </NavLink>
          <NavLink to="/host-dashboard">
            <Button variant="outline" className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm">
              <Home className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">
                {hasProperties ? t('hostDashboard') : t('becomeAHost')}
              </span>
            </Button>
          </NavLink>
        </>
      ) : (
        <>
          <NavLink to="/host-dashboard">
            <Button variant="outline" className="flex items-center gap-1 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm">
              <Home className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">{t('becomeAHost')}</span>
            </Button>
          </NavLink>
          <NavLink to="/login">
            <Button variant="ghost" className="h-8 sm:h-9 text-xs sm:text-sm">{t('login')}</Button>
          </NavLink>
          <NavLink to="/register">
            <Button className="btn-primary h-8 sm:h-9 text-xs sm:text-sm">{t('signUp')}</Button>
          </NavLink>
        </>
      )}
      <ThemeToggleButton />
      {user && <UserMenu user={user} handleLogout={handleLogout} />}
    </nav>
  );

  const renderMobileNav = () => (
    <div className="flex items-center justify-between w-full sm:w-auto">
      {/* Home link for mobile */}
      <Link to="/" className="flex sm:hidden items-center space-x-2">
        <div className="h-6 w-6 rounded-lg gradient-primary flex items-center justify-center">
          <Home className="h-3 w-3 text-white" />
        </div>
        <span className="text-lg font-bold text-foreground">StayFinder</span>
      </Link>
      
      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggleButton />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <Menu className="h-4 w-4 sm:h-6 sm:w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-xs bg-background p-3 sm:p-4 md:p-6 flex flex-col">
            <nav className="flex flex-col space-y-1 sm:space-y-2 md:space-y-4 flex-1">
              {user && (
                <>
                  <SheetClose asChild>
                    <Link to="/personal" className="w-full">
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9 sm:h-10 md:h-11 text-sm sm:text-base hover:border hover:border-border">
                        <UserCircle className="h-4 w-4" /> {t('profile')}
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/host-dashboard" className="w-full">
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9 sm:h-10 md:h-11 text-sm sm:text-base hover:border hover:border-border">
                        <Home className="h-4 w-4" /> {hasProperties ? t('hostDashboard') : t('becomeAHost')}
                      </Button>
                    </Link>
                  </SheetClose>
                </>
              )}
              <SheetClose asChild>
                <>{renderNavLinks(() => {})}</>
              </SheetClose>
              {user && (
                <>
                  <SheetClose asChild>
                    <Link to="/help" className="w-full">
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9 sm:h-10 md:h-11 text-sm sm:text-base hover:border hover:border-border">
                        <HelpCircle className="h-4 w-4" /> {t('helpAndSupport')}
                      </Button>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link to="/personal/security" className="w-full">
                      <Button variant="ghost" className="w-full justify-start gap-2 h-9 sm:h-10 md:h-11 text-sm sm:text-base hover:border hover:border-border">
                        <Lock className="h-4 w-4" /> {t('security')}
                      </Button>
                    </Link>
                  </SheetClose>
                  <div className="border-t border-border my-2 sm:my-4"></div>
                  <SheetClose asChild>
                    <Button 
                      variant="ghost" 
                      onClick={handleLogout}
                      className="w-full justify-start gap-2 h-9 sm:h-10 md:h-11 text-sm sm:text-base hover:border hover:border-border text-destructive hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" /> {t('logout')}
                    </Button>
                  </SheetClose>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-soft">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex h-12 sm:h-16 items-center justify-between">
          <Logo />
          {isMobile ? renderMobileNav() : renderDesktopNav()}
        </div>
      </div>
    </header>
  );
};

const Logo = () => (
  <Link to="/" className="hidden sm:flex items-center space-x-2">
    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg gradient-primary flex items-center justify-center">
      <Home className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
    </div>
    <span className="text-lg sm:text-xl font-bold text-foreground">StayFinder</span>
  </Link>
);

const ThemeToggleButton = () => {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="h-8 w-8 sm:h-9 sm:w-9 rounded-md"
    >
      <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

const UserMenu = ({ user, handleLogout }: { user: any; handleLogout: () => void }) => {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={getAvatarUrl(user.avatar)} alt={user.firstName} />
            <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a href="/profile" className="flex items-center gap-2">
              <User className="h-4 w-4" /> {t('profile')}
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/bookings" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> {t('bookings')}
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" /> {t('favorites')}
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/personal-security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> {t('security')}
            </a>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive flex items-center gap-2">
          <LogOut className="h-4 w-4" /> {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};