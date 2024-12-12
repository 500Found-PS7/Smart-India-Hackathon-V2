"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LineChart,
  Settings,
  Globe2,
  BarChart3,
  Calendar,
  Menu,
  ArrowLeftFromLine,
  ArrowRightFromLine,
  MessageSquare,
  Power
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "AI Assistant",
    icon: MessageSquare,
    href: "/dashboard/ai-insights",
    color: "text-violet-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
    color: "text-zinc-500",
  },
];

export function Sidebar({ isSidebarOpen, toggleSidebar }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-[#1C1C1E] text-white">
      {/* Header with Logo and Toggle */}
      <div className="p-6 border-b border-[#2C2C2E] flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center">
          <motion.div
            animate={{ 
              width: isSidebarOpen ? "auto" : "40px",
            }}
            className="overflow-hidden flex items-center gap-3"
          >
            <Power className="w-10 h-10" />
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="font-semibold text-sm text-white leading-tight"
              >
                Government of NCT  <br />
                of Delhi
                <div className="text-xs text-zinc-400">Load Forecasting</div>
              </motion.div>
            )}
          </motion.div>
        </Link>

        {/* Desktop Toggle Button */}
        <motion.div
          animate={{ opacity: 1 }}
          className="hidden lg:block"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/10 transition-colors"
          >
            {isSidebarOpen ? (
              <ArrowLeftFromLine className="h-4 w-4 text-white" />
            ) : (
              <ArrowRightFromLine className="h-4 w-4 text-white" />
            )}
          </Button>
        </motion.div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-white/10 transition-colors"
        >
          <Menu className="h-4 w-4 text-white" />
        </Button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="space-y-2">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <motion.div
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
                  "hover:bg-white/10 transition-colors",
                  pathname === route.href 
                    ? "bg-white/10 text-white" 
                    : "text-zinc-400"
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <route.icon className={cn("h-5 w-5 shrink-0", route.color)} />
                <AnimatePresence mode="wait">
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{
                        type: "spring",
                        damping: 25,
                        stiffness: 120,
                      }}
                      className="whitespace-nowrap"
                    >
                      {route.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Status Section */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 120,
            }}
            className="p-6 border-t border-[#2C2C2E]"
          >
            <motion.div 
              className="rounded-lg bg-[#2C2C2E] p-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <p className="text-xs text-zinc-400">System Status</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <p className="text-sm">All systems normal</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 