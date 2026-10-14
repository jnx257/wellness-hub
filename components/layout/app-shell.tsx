"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";

const NAV_ITEMS = [
  { href: "/", icon: "⌂", label: "Home" },
  { href: "/todo", icon: "✓", label: "ToDo" },
  { href: "/journal", icon: "✎", label: "Journaling" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const title =
    NAV_ITEMS.find((item) => isActive(pathname, item.href))?.label ?? "";

  return (
    <div className="bg-bg-app relative flex min-h-screen overflow-x-hidden">
      <aside
        className={`bg-bg-surface border-border sticky top-0 hidden h-screen flex-none flex-col gap-[4px] border-r py-[30px] transition-[width] duration-200 min-[900px]:flex ${
          collapsed ? "w-[76px] px-[14px]" : "w-[252px] px-[22px]"
        }`}
      >
        <div
          className={`mb-[26px] flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <span className="text-subtitle text-primary overflow-hidden font-bold tracking-wide whitespace-nowrap">
              Wellness Hub
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="border-border-strong text-primary hover:bg-bg-tab-track h-[30px] w-[30px] flex-none rounded-[8px] border bg-transparent text-[13px]"
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>
        <NavList pathname={pathname} collapsed={collapsed} />
        <div className="flex-1" />
        <LogoutButton collapsed={collapsed} />
      </aside>

      <div className="flex flex-1 justify-center">
        <div className="bg-bg-surface-alt shadow-card min-[900px]:bg-bg-app relative flex min-h-screen w-full max-w-[560px] flex-col min-[900px]:max-w-[820px] min-[900px]:shadow-none">
          <header className="flex flex-none items-center justify-between px-[22px] pt-[20px] pb-[14px] min-[900px]:px-[4px] min-[900px]:pt-[30px] min-[900px]:pb-[22px]">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="border-border-strong bg-bg-surface hover:bg-bg-tab-track flex h-[38px] w-[38px] flex-col items-center justify-center gap-[4px] rounded-md border min-[900px]:hidden"
            >
              <span className="bg-primary block h-[1.6px] w-[16px]" />
              <span className="bg-primary block h-[1.6px] w-[16px]" />
              <span className="bg-primary block h-[1.6px] w-[16px]" />
            </button>
            <h1 className="text-title text-primary hidden font-bold min-[900px]:block">
              {title}
            </h1>
            <span className="text-ink-500 text-[13px] font-semibold tracking-eyebrow uppercase min-[900px]:hidden">
              {title}
            </span>
            <div className="bg-primary text-on-primary flex h-[38px] w-[38px] items-center justify-center rounded-full text-[13px] font-semibold">
              M
            </div>
          </header>
          {children}
        </div>
      </div>

      <div className="min-[900px]:hidden">
        <div
          onClick={() => setDrawerOpen(false)}
          className={`bg-scrim fixed inset-0 z-20 transition-opacity duration-250 ${
            drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
        <nav
          inert={!drawerOpen}
          className={`bg-bg-surface shadow-drawer fixed top-0 bottom-0 left-0 z-21 flex w-[250px] flex-col gap-[4px] px-[20px] py-[26px] transition-transform duration-[280ms] ease-[cubic-bezier(.4,0,.2,1)] ${
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <span className="text-primary mb-[22px] text-[15px] font-bold tracking-wide">
            Wellness Hub
          </span>
          <NavList
            pathname={pathname}
            collapsed={false}
            onNavigate={() => setDrawerOpen(false)}
          />
          <div className="flex-1" />
          <LogoutButton collapsed={false} />
        </nav>
      </div>
    </div>
  );
}

function LogoutButton({ collapsed }: { collapsed: boolean }) {
  return (
    <button
      type="button"
      onClick={() => logout()}
      title="Logout"
      className={`hover:bg-bg-tab-track text-text-body flex w-full items-center gap-[12px] rounded-[9px] px-[12px] py-[11px] text-[14.5px] font-medium ${
        collapsed ? "justify-center" : "justify-start"
      }`}
    >
      <span className="text-[16px]">⏻</span>
      {!collapsed && <span>Logout</span>}
    </button>
  );
}

function NavList({
  pathname,
  collapsed,
  onNavigate,
}: {
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            onClick={onNavigate}
            className={`hover:bg-bg-tab-track flex w-full items-center gap-[12px] rounded-[9px] px-[12px] py-[11px] text-[14.5px] no-underline ${
              collapsed ? "justify-center" : "justify-start"
            } ${
              active
                ? "bg-bg-track text-primary font-semibold"
                : "text-text-body font-medium"
            }`}
          >
            <span className="text-[16px]">{item.icon}</span>
            {!collapsed && (
              <span className="overflow-hidden whitespace-nowrap">
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );
}
