"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";
import { LogOut, User as UserIcon } from "lucide-react";

export function Topbar() {
  const router = useRouter();
  const { user, demoUser, isDemo } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const displayName = user?.email || demoUser?.display_name || "Demo Reviewer";

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
          Platform
        </span>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-semibold text-slate-800">
          Subscription Management
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1 text-xs text-slate-700">
          <div className="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
            <UserIcon className="h-3 w-3" />
          </div>
          <span className="font-medium max-w-[150px] truncate">
            {displayName}
          </span>
          {isDemo && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
              DEMO
            </span>
          )}
        </div>

        <button
          onClick={handleSignOut}
          title="Sign out"
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}

