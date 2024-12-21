"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faFileAlt,
  faEye,
  faBriefcase,
  faCog,
  faBuilding,
  faDoorOpen,
  faUser,
  faBars,
  faSignOutAlt,
  faUserCog,
} from "@fortawesome/free-solid-svg-icons";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: faChartLine },
  { href: "/exams", label: "Exams", icon: faFileAlt },
  { href: "/surveillance", label: "Surveillance", icon: faEye },
  { href: "/emploi", label: "Emploi", icon: faBriefcase },
  { href: "/options", label: "Options", icon: faCog },
  { href: "/departement", label: "Départements", icon: faBuilding },
  { href: "/locaux", label: "Locaux", icon: faDoorOpen },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div className="bg-gray-50 p-8">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 px-12 py-2.5 fixed left-0 right-0 top-0 z-50">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-14 ml-14 w-auto" // Properly resized logo
            />
          </div>
            
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          "px-4 py-2",
                          pathname === item.href
                            ? "bg-gray-100 text-md text-gray-900" 
                            : "text-gray-600 text-md hover:text-gray-900"
                        )}
                      >
                        <FontAwesomeIcon icon={item.icon} className="mr-2" />
                        {item.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>

            {/* User Menu - Desktop */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <FontAwesomeIcon icon={faUser} className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <FontAwesomeIcon icon={faUser} className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <FontAwesomeIcon icon={faUserCog} className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-red-600">
                  <Link href="/login" className="flex items-center">
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 h-4 w-4" />
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-3">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center rounded-md px-4 py-2 text-sm font-medium",
                        pathname === item.href
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <FontAwesomeIcon icon={item.icon} className="mr-2" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-4 border-t" />
                  <Link
                    href="/profile"
                    className="flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <FontAwesomeIcon icon={faUserCog} className="mr-2" />
                    Settings
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center rounded-md px-4 py-2 text-sm font-medium text-red-600 hover:bg-gray-50"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                    Logout
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </div>
  );
}