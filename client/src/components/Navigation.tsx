import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Mic,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  CheckCircle,
  FileText
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return <GuestNavigation />;

  const isStudent = user.role === "student";

  const navItems = isStudent ? [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/applied-jobs", label: "Applied Jobs", icon: CheckCircle },
    { href: "/resume-builder", label: "Resume Builder", icon: FileText },
    { href: "/learning", label: "Learning", icon: GraduationCap },
    { href: "/interviews", label: "Mock Interviews", icon: Mic },
  ] : [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/jobs/create", label: "Post a Job", icon: Briefcase },
    { href: "/applicants", label: "Applicants", icon: User },
  ];

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-border/50">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl group-hover:scale-105 transition-transform">
              R
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">RiseUp</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer",
                location === item.href
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-muted transition-colors text-left">
                <Avatar className="w-10 h-10 border border-border">
                  <AvatarFallback className="bg-primary/10 text-primary">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate capitalize">{user.role}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => logoutMutation.mutate()}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-display font-bold text-xl">RiseUp</Link>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>
    </>
  );
}

function GuestNavigation() {
  const [location] = useLocation();
  const isAuthPage = location === "/login" || location === "/register";

  // Don't show nav on auth pages
  if (isAuthPage) return null;

  return (
    <nav className="absolute top-0 w-full z-50 px-6 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
            R
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">RiseUp</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/jobs"><span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Find Jobs</span></Link>
          <Link href="/learning"><span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Courses</span></Link>
          <Link href="/about"><span className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">About Us</span></Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="hidden sm:inline-flex">Log in</Button>
          </Link>
          <Link href="/register">
            <Button className="rounded-full px-6">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
