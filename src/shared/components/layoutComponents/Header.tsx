import { Button } from "@ui/button";
import {
  Menu,
  Bell,
  User,
  LogOut,
  BetweenHorizonalEnd,
  Heart,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Brand_white from "@assets/logos/Brand_white.png";
import Brand_black from "@assets/logos/Brand_black.png";
import { useNotifications } from "@/shared/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { FavoritesDialog } from "@/features/CustomerSide/Favorites/components/FavoritesDialog";
import { UserBookingsDialog } from "@/features/CustomerSide/Bookings/UserBookingsDialog";

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, isLoading } =
    useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);

  return (
    <div className="flex items-center justify-between bg-black py-4 pt-5 pl-5">
      <a href="/">
        <img className="w-[calc(13vw+5rem)]" src={Brand_white} alt="" />
      </a>
      <nav className="hidden py-3 pr-5 sm:block">
        <ul className="flex px-4 gap-6 text-[1.25rem] text-primary-foreground justify-between items-center">
          <div className="flex gap-6">
            <Link to={"/"} className="hover:underline">
              Home
            </Link>
            <Link to={"/games"} className="hover:underline">
              Games
            </Link>
            <Link to={"/futsals"} className="hover:underline">
              Book Futsal
            </Link>
            <Link to={"/contact"} className="hover:underline">
              Contact Us
            </Link>
          </div>

          {isAuthenticated ? (
            // Logged in state
            <div className="flex items-center gap-2">
              <li className="flex items-center gap-2">
                {user?.role === "user" && (
                  <button
                    className="relative p-2 text-primary-foreground hover:bg-primary-foreground/10 rounded-full transition-colors"
                    onClick={() => setIsFavoritesOpen(true)}
                    aria-label="Favorites"
                  >
                    <Heart className="w-6 h-6" />
                  </button>
                )}

                <div className="relative">
                  <DropdownMenu
                    open={isDropdownOpen}
                    onOpenChange={setIsDropdownOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <button
                        className="relative p-2"
                        aria-label="Notifications"
                        onClick={() => {
                          // Mark all as read when opening the dropdown
                          if (!isDropdownOpen && unreadCount > 0) {
                            const unreadIds = notifications
                              .filter((n) => !n.isRead)
                              .map((n) => n._id);
                            if (unreadIds.length > 0) {
                              markAsRead(unreadIds);
                            }
                          }
                          setIsDropdownOpen(!isDropdownOpen);
                        }}
                      >
                        <Bell className="w-6 h-6 text-primary-foreground cursor-pointer" />
                        {unreadCount > 0 && (
                          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-96 max-h-[500px] overflow-hidden bg-background text-foreground rounded-lg shadow-lg border"
                      align="end"
                      sideOffset={8}
                      onInteractOutside={() => {
                        // Mark all visible notifications as read when clicking outside
                        const visibleUnreadNotifications = notifications
                          .slice(0, 8)
                          .filter((n) => !n.isRead)
                          .map((n) => n._id);

                        if (visibleUnreadNotifications.length > 0) {
                          markAsRead(visibleUnreadNotifications);
                        }
                      }}
                    >
                      <div className="sticky top-0 bg-background z-10 border-b px-4 py-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">
                            Notifications
                          </h3>
                          {unreadCount > 0 && (
                            <button
                              className="text-sm font-medium text-primary hover:text-primary/90 transition-colors"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const unreadIds = notifications
                                  .filter((n) => !n.isRead)
                                  .map((n) => n._id);
                                if (unreadIds.length > 0) {
                                  await markAsRead(unreadIds);
                                }
                              }}
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="divide-y max-h-[calc(500px-57px)] overflow-y-auto">
                        {isLoading ? (
                          <div className="p-6 text-center text-muted-foreground text-sm">
                            <div className="animate-pulse space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
                              <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
                            </div>
                          </div>
                        ) : !notifications?.length ? (
                          <div className="p-6 text-center text-muted-foreground text-sm">
                            No new notifications
                          </div>
                        ) : (
                          (Array.isArray(notifications) ? notifications : [])
                            .slice(0, 8)
                            .map((notification) => {
                              if (!notification?._id) return null;

                              const notificationDate =
                                notification.time || notification.createdAt;
                              const formattedDate = notificationDate
                                ? new Date(notificationDate).toLocaleTimeString(
                                    "en-US",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: true,
                                    },
                                  ) +
                                  " • " +
                                  new Date(notificationDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )
                                : "Just now";

                              return (
                                <div
                                  key={notification._id}
                                  className={`relative px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer group ${!notification.isRead ? "bg-accent/30" : ""}`}
                                  onClick={async (e) => {
                                    e.stopPropagation();

                                    // Mark as read if not already read
                                    if (!notification.isRead) {
                                      await markAsRead([notification._id]);
                                    }

                                    // Navigate to relevant page
                                    if (notification.meta?.booking) {
                                      navigate(
                                        `/bookings/${notification.meta.booking}`,
                                      );
                                    } else if (notification.meta?.futsal) {
                                      navigate(
                                        `/futsals/${notification.meta.futsal}`,
                                      );
                                    }
                                  }}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                      <div
                                        className={`w-2.5 h-2.5 rounded-full transition-colors ${!notification.isRead ? "bg-primary" : "bg-transparent"}`}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-foreground leading-snug">
                                        {notification.message ||
                                          "New notification"}
                                      </p>
                                      <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-muted-foreground">
                                          {formattedDate}
                                        </p>
                                        {!notification.isRead && (
                                          <button
                                            className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-foreground"
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              await markAsRead([
                                                notification._id,
                                              ]);
                                            }}
                                          >
                                            Mark as read
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>

              <li>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center rounded-full cursor-pointer">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={user?.profileImage}
                          alt={user?.name}
                        />
                        <AvatarFallback className="bg-primary-foreground text-primary">
                          {user?.name?.charAt(0).toUpperCase() || (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline">{user?.name}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-primary-foreground text-black rounded shadow-lg z-50">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsBookingsOpen(true)}>
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>My Bookings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem
                        onClick={() => navigate("/admin/dashboard")}
                      >
                        <span>Admin Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    {user?.role === "futsalOwner" && (
                      <DropdownMenuItem
                        onClick={() => navigate("/futsal-owner/dashboard")}
                      >
                        <BetweenHorizonalEnd />
                        <span>Futsal Owner Dashboard</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            </div>
          ) : (
            // Not logged in state
            <li className="flex gap-2">
              <Button variant="reverse" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button variant="reverse" onClick={() => navigate("/register")}>
                Register
              </Button>
            </li>
          )}
        </ul>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <button className="block p-2 pr-7 sm:hidden text-primary-foreground">
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[250px] sm:w-[300px] bg-background p-0"
        >
          <div className="flex h-full flex-col">
            <div className="p-4 border-b">
              <img className="w-40" src={Brand_black} alt="PitchBook" />
            </div>
            <nav className="flex-1 p-4 space-y-2">
              <SheetClose asChild>
                <Link
                  to="/"
                  className="block px-4 py-2 text-lg hover:bg-accent/50 rounded-md transition-colors"
                >
                  Home
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  to="/games"
                  className="block px-4 py-2 text-lg hover:bg-accent/50 rounded-md transition-colors"
                >
                  Games
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Link
                  to="/futsals"
                  className="block px-4 py-2 text-lg hover:bg-accent/50 rounded-md transition-colors"
                >
                  Book Futsal
                </Link>
              </SheetClose>

              {isAuthenticated ? (
                <div className="pt-4 mt-4 border-t">
                  <SheetClose asChild>
                    <button
                      onClick={() => setIsBookingsOpen(true)}
                      className="w-full text-left px-4 py-2 text-lg hover:bg-accent/50 rounded-md transition-colors"
                    >
                      My Bookings
                    </button>
                  </SheetClose>
                  {user?.role === "user" && (
                    <SheetClose asChild>
                      <button
                        onClick={() => setIsFavoritesOpen(true)}
                        className="w-full text-left px-4 py-2 text-lg hover:bg-accent/50 rounded-md transition-colors"
                      >
                        Favorites
                      </button>
                    </SheetClose>
                  )}
                  <SheetClose asChild>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-lg hover:bg-accent/50 rounded-md transition-colors"
                    >
                      Profile
                    </Link>
                  </SheetClose>
                  {user?.role === "admin" && (
                    <SheetClose asChild>
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-lg hover:bg-accent/50 rounded-md transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    </SheetClose>
                  )}
                  {user?.role === "futsalOwner" && (
                    <SheetClose asChild>
                      <Link
                        to="/futsal-owner/dashboard"
                        className="block px-4 py-2 text-lg hover:bg-accent/50 rounded-md transition-colors"
                      >
                        Futsal Owner Dashboard
                      </Link>
                    </SheetClose>
                  )}
                  <SheetClose asChild>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-lg text-destructive hover:bg-destructive/10 rounded-md transition-colors mt-4"
                    >
                      Logout
                    </button>
                  </SheetClose>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t space-y-2">
                  <SheetClose asChild>
                    <Button
                      onClick={() => navigate("/login")}
                      className="w-full"
                    >
                      Login
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/register")}
                      className="w-full"
                    >
                      Register
                    </Button>
                  </SheetClose>
                </div>
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Favorites Dialog */}
      <FavoritesDialog
        open={isFavoritesOpen}
        onOpenChange={setIsFavoritesOpen}
      />
      <UserBookingsDialog
        open={isBookingsOpen}
        onOpenChange={setIsBookingsOpen}
      />
    </div>
  );
};

export default Header;
