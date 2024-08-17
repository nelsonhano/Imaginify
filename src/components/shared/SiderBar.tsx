'use client'

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import Image from "next/image"
import Link from "next/link"
import { navLinks } from "../../../constants"
import { usePathname } from "next/navigation"
import { Button } from "../ui/button"

function SiderBar() {
  const pathname = usePathname()
  return (
    <aside className="sidebar">
       <div className="flex size-full flex-col gap-4">
        <Link href='/' className="sidebar-logo">
          <Image src='/assets/images/logo-text.svg' alt="logo" width={128} height={28}/>
        </Link>

        <nav className="siderbar-nav">
          <SignedIn>
            <ul className="siderbar-nav_elements ">
              {navLinks.slice(0,6).map((link) => {
                const isActive = link.route === pathname;

                return (
                  <li
                   key={link.route}
                   className={`siderbar-nav_element group items-center ${
                    isActive ? 'bg-purple-gradient rounded-md text-white': 'text-gray-700'
                   }`} 
                  >
                    <Link href={link.route} className="sidebar-link">
                      <Image
                        src={link.icon}
                        alt="logo"
                        width={24}
                        height={24}
                        className={`${isActive && 'brightness-200'}`}
                      />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>

            <ul className="siderbar-nav_elements mt-24">
              {navLinks.slice(6).map((link) => {
                const isActive = link.route === pathname;

                return (
                  <li
                    key={link.route}
                    className={`siderbar-nav_element group items-center ${isActive ? 'bg-purple-gradient rounded-md text-white' : 'text-gray-700'
                      }`}
                  >
                    <Link href={link.route} className="sidebar-link">
                      <Image
                        src={link.icon}
                        alt="logo"
                        width={24}
                        height={24}
                        className={`${isActive && 'brightness-200'}`}
                      />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
              <li className="flex-center cursor-pointer gap-2 p-4 -ml-16 mt-3">
                <UserButton afterSignOutUrl="/" showName />
              </li>
            </ul>
          </SignedIn>

          <SignedOut>
            <Button asChild className="button bg-purple-gradient bg-cover">
              <Link href='/sign-in'>Login</Link>
            </Button>    
          </SignedOut>
        </nav>
       </div>
    </aside>
  )
}

export default SiderBar
