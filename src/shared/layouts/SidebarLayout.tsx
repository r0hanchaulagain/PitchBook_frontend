import { useState, useEffect } from "react";
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Settings,
  LogOut,
  Image as ImageIcon,
  Home,
  Key,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import { ModeToggle } from "@ui/theme-toggle";
import { ThemeProvider } from "@hooks/theme-provider";
import { useIsMobile } from "@hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { apiMutation } from "@/shared/lib/apiWrapper";
import ImageUploader from "@/shared/components/ImageUploader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
export type SidebarItem = {
  icon: React.ElementType;
  label: string;
  to: string;
};
type DashboardLayoutProps = {
  sidebarItems: SidebarItem[];
  title?: string;
  logo?: string;
  children?: React.ReactNode;
};
export default function DashboardLayout({
  sidebarItems,
  title = "Dashboard",
  logo,
  children,
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  useEffect(() => {
    if (user) {
      setIsMfaEnabled(user.isMfaEnabled || false);
    } else {
      setIsMfaEnabled(false);
    }
  }, [user]);
  const handleForgotPassword = async () => {
    if (!user?.email) {
      toast.error("Email not available. Please try logging in again.");
      return;
    }
    setForgotLoading(true);
    try {
      await apiMutation({
        method: "POST",
        endpoint: "users/forgot-password",
        body: { email: user.email },
      });
      navigate("/auth/forgot-status", {
        state: {
          status:
            "If your email is registered, a password reset link has been sent. Please check your inbox (and spam folder).",
          image: "/mail-sent.png",
        },
        replace: true,
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset link. Try again.");
    } finally {
      setForgotLoading(false);
    }
  };
  const handleProfilePictureUpload = async ({ image }: { image: File }) => {
    if (!image) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", image);
    try {
      const endpoint = user?.profileImage
        ? "users/update-profile-image"
        : "users/upload-profile-image";
      await apiMutation({
        method: "POST",
        endpoint,
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setShowImageUploader(false);
      window.location.reload();
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to update profile picture. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };
  const handleLogout = async () => {
    try {
      toast.success("Logging out...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };
  const toggleSidebar = () => setIsCollapsed((c) => !c);
  const openMobileMenu = () => setIsMobileMenuOpen(true);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeMobileMenu();
    }
  };
  return (
    <ThemeProvider>
      <div className="min-h-screen">
        <div className="flex h-screen bg-background text-foreground">
          {}
          {isMobile ? (
            <>
              {}
              {!isMobileMenuOpen && isCollapsed && (
                <div className="w-16 bg-card border-r border-border flex flex-col h-full z-30 fixed md:relative min-w-0">
                  <div className="p-4 border-b border-border flex flex-col items-center min-w-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mb-2">
                      {logo ? (
                        <img src={logo} alt="Logo" className="w-full h-auto" />
                      ) : (
                        <User className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                  <nav className="flex-1 p-2 flex flex-col items-center min-w-0">
                    <ul className="space-y-1">
                      {sidebarItems.map((item, index) => {
                        const IconComponent = item.icon;
                        const isActive = location.pathname === item.to;
                        return (
                          <li key={index}>
                            <NavLink
                              to={item.to}
                              className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm transition-colors ${
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              }`}
                              aria-label={item.label}
                            >
                              <IconComponent className="w-5 h-5 flex-shrink-0" />
                              <span className="whitespace-nowrap min-w-0" />
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
              )}
              {}
              {isMobileMenuOpen && (
                <div
                  className="fixed inset-0 z-40 flex md:hidden"
                  onClick={handleOverlayClick}
                >
                  {}
                  <div className="absolute inset-0 bg-black/50 transition-opacity" />
                  {}
                  <div
                    className={`relative w-64 bg-card border-r border-border flex flex-col h-full z-50 animate-slide-in-left`}
                  >
                    {}
                    <button
                      className="absolute top-4 right-4 p-2 rounded-lg hover:bg-accent hover:text-accent-foreground"
                      onClick={closeMobileMenu}
                      aria-label="Close sidebar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    {}
                    <div className="p-4 border-b border-border mt-10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          {logo ? (
                            <img
                              src={logo}
                              alt="Logo"
                              className="w-full h-auto"
                            />
                          ) : (
                            <User className="w-5 h-5 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-primary-foreground whitespace-nowrap min-w-0">
                            {title}
                          </h2>
                        </div>
                      </div>
                    </div>
                    {}
                    <nav className="flex-1 p-2 mt-2">
                      <ul className="space-y-1">
                        {sidebarItems.map((item, index) => {
                          const IconComponent = item.icon;
                          const isActive = location.pathname === item.to;
                          return (
                            <li key={index}>
                              <NavLink
                                to={item.to}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                  isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                }`}
                                onClick={closeMobileMenu}
                              >
                                <IconComponent className="w-5 h-5 flex-shrink-0" />
                                <span className="whitespace-nowrap min-w-0">
                                  {item.label}
                                </span>
                              </NavLink>
                            </li>
                          );
                        })}
                      </ul>
                    </nav>
                  </div>
                </div>
              )}
              {}
              {!isMobileMenuOpen && !isCollapsed && (
                <div className="w-64 bg-card border-r border-border flex flex-col h-full z-30 fixed md:relative min-w-0 transition-all duration-300">
                  <div className="p-4 border-b border-border flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      {logo ? (
                        <img src={logo} alt="Logo" className="w-full h-auto" />
                      ) : (
                        <User className="w-5 h-5 text-primary-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-grow">
                      <h2 className="text-lg font-semibold text-foreground whitespace-nowrap min-w-0">
                        {title}
                      </h2>
                    </div>
                  </div>
                  <nav className="flex-1 p-2 mt-2 min-w-0">
                    <ul className="space-y-1">
                      {sidebarItems.map((item, index) => {
                        const IconComponent = item.icon;
                        const isActive = location.pathname === item.to;
                        return (
                          <li key={index}>
                            <NavLink
                              to={item.to}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                isActive
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                              }`}
                            >
                              <IconComponent className="w-5 h-5 flex-shrink-0" />
                              {!isCollapsed && (
                                <span className="whitespace-nowrap min-w-0">
                                  {item.label}
                                </span>
                              )}
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <div
              className={`${isCollapsed ? "w-16" : "w-64"} transition-all duration-300 bg-card border-r border-border flex flex-col h-full z-30 min-w-0`}
            >
              {}
              <div className="p-4 border-b border-border flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-full h-auto" />
                  ) : (
                    <User className="w-5 h-5 text-primary-foreground" />
                  )}
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-grow">
                    <h2 className="text-lg font-semibold text-foreground whitespace-nowrap min-w-0">
                      {title.split(" ").map((word, i) => (
                        <span key={i}>
                          {word}
                          {i < title.split(" ").length - 1 ? <br /> : null}
                        </span>
                      ))}
                    </h2>
                  </div>
                )}
              </div>
              {}
              <nav className="flex-1 p-2 mt-2 min-w-0">
                <ul className="space-y-1">
                  {sidebarItems.map((item, index) => {
                    const IconComponent = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                      <li key={index}>
                        <NavLink
                          to={item.to}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          }`}
                        >
                          <IconComponent className="w-5 h-5 flex-shrink-0" />
                          {!isCollapsed && (
                            <span className="whitespace-nowrap min-w-0">
                              {item.label}
                            </span>
                          )}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          )}
          {}
          <div className="flex-1 flex flex-col min-w-0">
            {}
            <header className="h-16 bg-card border-b border-border pr-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {}
                <button
                  onClick={toggleSidebar}
                  className="p-2 bg-accent hover:bg-accent hover:text-accent-foreground rounded-tr-lg rounded-br-lg transition-colors"
                  aria-label={
                    isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-5 h-5 text-white" />
                  ) : (
                    <ChevronLeft className="w-5 h-5 text-white" />
                  )}
                </button>
                {}
                {isMobile && !isMobileMenuOpen && (
                  <button
                    className="bg-accent p-2 rounded-tr-lg rounded-br-lg transition-colors md:hidden ml-3"
                    onClick={openMobileMenu}
                    aria-label="Open sidebar"
                  >
                    <Menu className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <ModeToggle />
                <button className="p-2 hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="w-8 h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-primary-foreground" />
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-semibold">
                      Account
                    </div>
                    <DropdownMenuSeparator />
                    {}
                    {user?.role === "futsalOwner" && (
                      <>
                        <DropdownMenuItem onClick={() => navigate("/")}>
                          <Home className="mr-2 h-4 w-4" />
                          <span>Return to Homepage</span>
                        </DropdownMenuItem>
                        {!user?.authProvider && (
                          <DropdownMenuItem
                            onClick={handleForgotPassword}
                            disabled={forgotLoading}
                          >
                            <Key className="mr-2 h-4 w-4" />
                            <span>
                              {forgotLoading ? "Sending..." : "Reset Password"}
                            </span>
                          </DropdownMenuItem>
                        )}
                        {!isMfaEnabled && !user?.authProvider && (
                          <DropdownMenuItem
                            onClick={() => navigate("/enable-mfa")}
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Enable MFA</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowImageUploader(true);
                      }}
                    >
                      <ImageIcon className="mr-2 h-4 w-4" />
                      <span>Change Profile Picture</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-destructive focus:text-destructive"
                      onClick={() => setShowLogoutDialog(true)}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {}
                <Dialog
                  open={showImageUploader}
                  onOpenChange={setShowImageUploader}
                >
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Update Profile Picture</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <ImageUploader
                        uploadFn={handleProfilePictureUpload}
                        imageURL={user?.profileImage}
                        fallbackText="Drag and drop your image here, or click to select"
                        buttonText={
                          isUploading ? "Uploading..." : "Save Changes"
                        }
                        isUploading={isUploading}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </header>
            {}
            <AlertDialog
              open={showLogoutDialog}
              onOpenChange={setShowLogoutDialog}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to log out?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    You'll need to sign in again to access your account.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Log out
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {}
            <main className="flex-1 p-4 md:p-6 bg-background overflow-auto">
              <div className="max-w-7xl mx-auto">
                {}
                {children ? children : <Outlet />}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
