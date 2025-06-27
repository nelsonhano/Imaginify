import MobileNav from "@/components/shared/MobileNav"
import SiderBar from "@/components/shared/SiderBar"
import React from "react";

function Layout(
    { children }: {
        children: React.ReactNode
    }) {
    return (
        <main className='root'>
            <SiderBar />
            <MobileNav />

            <div className='root-container'>
                <div className='wrapper'>
                    {children}
                </div>
            </div>
        </main>
    )
}

export default Layout
