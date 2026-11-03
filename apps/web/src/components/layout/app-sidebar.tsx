"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Calendar,
  Sparkles,
  Bot,
  Activity,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Insights", href: "/insights", icon: Sparkles },
  { name: "AI Assistant", href: "/assistant", icon: Bot },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { isDemo, isConfigured } = useAuth();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200/80 bg-white min-h-screen flex flex-col justify-between">
      <div>
        {/* SubGuard Logo & Brand */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400 font-bold shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                SubGuard
              </span>
              <span className="block text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                Intelligence
              </span>
            </div>
          </Link>
        </div>

        {/* Demo Mode Notice */}
        {isDemo && (
          <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900">
            <div className="font-semibold flex items-center gap-1">
              <span>🎯</span> Demo Account
            </div>
            <p className="mt-1 text-[11px] text-amber-800 leading-relaxed">
              Viewing demo data. Changes are isolated and safe.
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="mt-4 px-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-emerald-400" : "text-slate-400"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
        <span>SubGuard MVP</span>
        <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {isConfigured ? "Supabase Live" : "Demo Mode"}
        </span>
      </div>
    </aside>
  );
}

