"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useLanguage } from "@/contexts/LanguageContext"
import { 
  HomeIcon, 
  CalendarIcon, 
  CheckCircleIcon, 
  UserIcon,
  UsersIcon,
  ChartBarIcon,
  BellIcon
} from "@heroicons/react/24/outline"
import {
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
  UserIcon as UserIconSolid,
  UsersIcon as UsersIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  BellIcon as BellIconSolid
} from "@heroicons/react/24/solid"

export default function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { language } = useLanguage()
  
  // Don't show on login/signup pages
  if (pathname === "/login" || pathname === "/signup") {
    return null
  }

  const isAdmin = session?.user?.role === "admin"

  const marshalLinks = [
    {
      name: "Home",
      nameAr: "الرئيسية",
      href: "/dashboard",
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
    {
      name: "Events",
      nameAr: "الفعاليات",
      href: "/dashboard/events",
      icon: CalendarIcon,
      iconSolid: CalendarIconSolid,
    },
    {
      name: "Attendance",
      nameAr: "الحضور",
      href: "/dashboard/attendance",
      icon: CheckCircleIcon,
      iconSolid: CheckCircleIconSolid,
    },
    {
      name: "Profile",
      nameAr: "الملف",
      href: "/dashboard/profile",
      icon: UserIcon,
      iconSolid: UserIconSolid,
    },
  ]

  const adminLinks = [
    {
      name: "Home",
      nameAr: "الرئيسية",
      href: "/admin",
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
    },
    {
      name: "Marshals",
      nameAr: "المارشالات",
      href: "/admin/marshals",
      icon: UsersIcon,
      iconSolid: UsersIconSolid,
    },
    {
      name: "Events",
      nameAr: "الفعاليات",
      href: "/admin/events",
      icon: CalendarIcon,
      iconSolid: CalendarIconSolid,
    },
    {
      name: "Reports",
      nameAr: "التقارير",
      href: "/admin/reports",
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
    },
  ]

  const links = isAdmin ? adminLinks : marshalLinks

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-t border-red-600/30 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(link.href + "/")
          const Icon = isActive ? link.iconSolid : link.icon
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-col items-center justify-center flex-1 h-full transition-colors"
            >
              <Icon 
                className={`w-6 h-6 mb-1 transition-colors ${
                  isActive 
                    ? "text-red-500" 
                    : "text-gray-400 hover:text-gray-300"
                }`}
              />
              <span 
                className={`text-xs transition-colors ${
                  isActive 
                    ? "text-red-500 font-semibold" 
                    : "text-gray-400"
                }`}
              >
                {language === "ar" ? link.nameAr : link.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
