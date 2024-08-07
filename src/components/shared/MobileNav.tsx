'use client'

import { Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet"
import { SignedIn, UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

import { navLinks } from "../../../constants"

function MobileNav() {
    const pathname = usePathname()
  return (
    <header className="header">
      <Link href='/' className="flex items-center flex-row w-full justify-between md:py-2">
        <Image
            src='/assets/images/logo-text.svg'
            alt='logo'
            width={180}
            height={28}
        />
        <nav className="flex gap-2">
            <SignedIn>
                <UserButton afterSignOutUrl='/' />
                <Sheet>
                    <SheetTrigger>
                        <Image 
                            src='/assets/icons/menu.svg'
                            alt='menu'
                            width={32}
                            height={32}
                        />
                    </SheetTrigger>
                    <SheetContent
                        className='sheet-content sm:w-64'
                    >
                        <>
                            <Image
                                src='/assets/images/logo-text.svg'
                                alt='logo'
                                width={152}
                                height={23}
                            />
                            <ul className="header-nav_elements mt-10">
                                {navLinks.map((link) => {
                                    const isActive = link.route === pathname;
                               return (
                                        <li
                                            key={link.route}
                                            className={` ${isActive && 'gradient-text' }
                                            p-18 flex whitespace-nowrap text-dark-700
                                            `}
                                        >
                                            <Link href={link.route} className="sidebar-link cursor-pointer">
                                                <Image
                                                    src={link.icon}
                                                    alt="logo"
                                                    width={24}
                                                    height={24}
                                                />
                                                {link.label}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </>
                    </SheetContent>
                </Sheet>
            </SignedIn>
        </nav>
      </Link>
    </header>
  )
}

export default MobileNav
