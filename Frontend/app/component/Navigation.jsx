'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton, useUser } from "@clerk/nextjs";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

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
            <div className="ml-10 flex items-baseline space-x-4">
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
                  <SignOutButton>
                    <Button className="bg-red-500 hover:bg-red-600 text-white px-3 sm:px-6 py-1 sm:py-2 text-sm sm:text-base font-bold rounded-md">
                      Sign Out
                    </Button>
                  </SignOutButton>
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
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="text-white block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:font-bold transition-all">
              Home
            </Link>
            <Link href="/forecast" className="text-white block px-3 py-2 rounded-md text-base font-medium hover:text-primary hover:font-bold transition-all">
              Forecast
            </Link>
            {isSignedIn ? (
              <div className="space-y-2">
                <span className="text-white block px-3 py-2">
                  Welcome, {user.firstName || user.username}
                </span>
                <SignOutButton>
                  <Button className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 w-full text-base font-bold rounded-md">
                    Sign Out
                  </Button>
                </SignOutButton>
              </div>
            ) : (
              <div className="space-y-2">
                <Link href="/sign-in">
                  <Button className="bg-white text-black px-3 py-2 w-full text-base font-bold rounded-md hover:bg-gray-100">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 w-full text-base font-bold rounded-md">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 