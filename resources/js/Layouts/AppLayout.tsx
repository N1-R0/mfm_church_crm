import { Link, router, usePage } from "@inertiajs/react";
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  LogOut,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  Users,
  X,
} from "lucide-react";
import type { PageProps } from "@/types";

type NavigationItem = {
  label: string;
  href: string;
  icon: typeof BarChart3;
};

type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

const mainNavigation: NavigationSection[] = [
  {
    label: "Main",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Church Management",
    items: [
      {
        label: "Members",
        href: "/members",
        icon: Users,
      },
      {
        label: "Attendance",
        href: "/attendance",
        icon: CalendarCheck,
      },
    ],
  },
];

const adminNavigation: NavigationSection = {
  label: "Administration",
  items: [
    {
      label: "Users",
      href: "/admin/users",
      icon: ShieldCheck,
    },
    {
      label: "Audit Log",
      href: "/admin/audit-log",
      icon: ClipboardList,
    },
  ],
};

export default function AppLayout({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const { auth, flash } = usePage<PageProps>().props;

  const [open, setOpen] = useState(false);

  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  const toggleTheme = () => {
    const next = !dark;

    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.theme = next ? "dark" : "light";
  };

  const navigationSections: NavigationSection[] = [
    ...mainNavigation,
    ...(auth.user?.role === "admin" ? [adminNavigation] : []),
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(href);
  };

  const initials =
    auth.user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "";

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-main">
            <img
              className="brand-logo"
              src="/images/mfm-youth-logo.png"
              alt="MFM Youth Church logo"
            />

            <div className="brand-copy">
              <strong>MFM Youth Church CRM</strong>
              <small>Ogba Youth Church</small>
            </div>
          </div>

          <button
            type="button"
            className="mobile-close"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>

        <nav className="sidebar-navigation">
          {navigationSections.map((section) => (
            <div className="nav-section" key={section.label}>
              <div className="nav-section-label">{section.label}</div>

              <div className="nav-section-items">
                {section.items.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={isActive(href) ? "active" : ""}
                  >
                    <Icon />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-user">
          <span className="sidebar-user-avatar">{initials}</span>

          <div className="sidebar-user-details">
            <strong>{auth.user?.name}</strong>
            <small>{auth.user?.role}</small>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="menu"
            onClick={() => setOpen(true)}
            aria-label="Open navigation"
          >
            <Menu />
          </button>

          <div className="topbar-title">
            <h1>{title}</h1>
            <small>Ogba Youth Church</small>
          </div>

          <div className="top-actions">
            <div className="global-search">
              <Search />

              <input
                aria-label="Search the CRM"
                placeholder="Search the CRM"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    router.get("/members", {
                      search: event.currentTarget.value,
                    });
                  }
                }}
              />
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {dark ? <Sun /> : <Moon />}
            </button>

            <button
              type="button"
              className="logout"
              onClick={() => router.post("/logout")}
            >
              <LogOut />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <main className="content">
          {flash.success && (
            <div className="alert success">{flash.success}</div>
          )}

          {flash.error && <div className="alert error">{flash.error}</div>}

          {children}
        </main>
      </div>

      {open && (
        <button
          type="button"
          className="backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
    </div>
  );
}
