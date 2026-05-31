"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Lightbulb,
  BarChart3,
  Settings,
  User,
  Zap,
  LogOut,
  X,
  Cpu,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

const MAIN_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/logs", label: "Daily Logs", icon: BookOpen },
  { href: "/insights", label: "Insights", icon: Lightbulb },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const AI_ITEMS = [
  { href: "/architect", label: "Project Architect", icon: Cpu },
  { href: "/coach", label: "Learning Coach", icon: GraduationCap },
];

const ACCOUNT_ITEMS = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebar();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          "sidebar flex flex-col z-50 fixed left-0 top-0 h-full transition-all duration-300 ease-in-out lg:translate-x-0 lg:static",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed && "collapsed"
        )}
      >
        {/* Toggle Button for Desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex sidebar-toggle"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        {/* Logo and Brand */}
        <div className="sidebar-brand">
          <Link href="/dashboard" className="flex items-center gap-3 w-full" onClick={onClose}>
            <div className="sidebar-logo">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="sidebar-brand-text font-bold bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">
              FlowState
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white transition-colors p-1 rounded ml-auto"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {/* Main items */}
          <div className="nav-section-label">Main</div>
          {MAIN_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn("nav-item", isActive(href) && "active")}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{label}</span>
            </Link>
          ))}

          <div className="nav-separator" />

          {/* AI Tools */}
          <div className="nav-section-label">AI Engineering</div>
          {AI_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn("nav-item", isActive(href) && "active")}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{label}</span>
            </Link>
          ))}

          <div className="nav-separator" />

          {/* Account */}
          <div className="nav-section-label">Account</div>
          {ACCOUNT_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn("nav-item", isActive(href) && "active")}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer with signout */}
        <div className="sidebar-footer">
          <button
            onClick={handleSignOut}
            id="signout-btn"
            className="nav-item hover:text-rose-500 hover:bg-rose-500/10 w-full text-left"
          >
            <LogOut className="nav-icon" />
            <span className="nav-label">Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}


export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
      aria-label="Open menu"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
}
