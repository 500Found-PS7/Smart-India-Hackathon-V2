'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton, useUser, UserButton } from "@clerk/nextjs";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  return (
    <nav className="bg-[#030303] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="relative w-40 h-40 mt-8">
              <Image 
                src="/power.png" 
                alt="Ministry of Power Logo"
                priority
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/" className="text-white hover:text-primary hover:font-bold transition-all cursor-pointer hover:scale-110">
                Home
              </Link>
              <Link href="/forecast" className="text-white hover:text-primary hover:font-bold transition-all cursor-pointer hover:scale-110">
                Forecast
              </Link>
              {isSignedIn ? (
                <div className="flex items-center gap-4">
                  <span className="text-white">
                    Welcome, {user.firstName || user.username}
                  </span>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        userButtonBox: "hover:bg-neutral-800",
                        userButtonOuterIdentifier: "text-gray-300",
                        userButtonPopoverCard: "bg-neutral-900 border border-neutral-800",
                        userButtonPopoverFooter: "border-t border-neutral-800",
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/sign-in">
                    <Button className="bg-white text-black px-3 sm:px-6 py-1 sm:py-2 text-sm sm:text-base font-bold rounded-md hover:bg-gray-100">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-6 py-1 sm:py-2 text-sm sm:text-base font-bold rounded-md">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function DashboardSidebar() {
  const { isSignedIn, user } = useUser();

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-[#030303] border-r border-neutral-800">
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="p-4">
          <Link href="/" className="text-white font-semibold text-xl">
            SLDC Dashboard
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link href="/dashboard" className="flex items-center text-gray-300 hover:text-white hover:bg-neutral-800 px-4 py-2 rounded">
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/ai-insights" className="flex items-center text-gray-300 hover:text-white hover:bg-neutral-800 px-4 py-2 rounded">
                <span>AI Insights</span>
              </Link>
            </li>
            <li>
              <Link href="/forecast" className="flex items-center text-gray-300 hover:text-white hover:bg-neutral-800 px-4 py-2 rounded">
                <span>Forecast</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Section at Bottom */}
        <div className="p-4 border-t border-neutral-800">
          {isSignedIn && (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">
                  {user.firstName || user.username}
                </span>
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonBox: "hover:bg-neutral-800",
                      userButtonOuterIdentifier: "text-gray-300",
                      userButtonPopoverCard: "bg-neutral-900 border border-neutral-800",
                      userButtonPopoverFooter: "border-t border-neutral-800",
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 