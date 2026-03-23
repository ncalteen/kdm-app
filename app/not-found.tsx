'use client'

import { SiteHeader } from '@/components/side-header'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ReactElement } from 'react'

export default function Page(): ReactElement {
  return (
    <div className="[--header-height:calc(--spacing(10))] min-w-[450px]">
      <SidebarProvider>
        <SiteHeader />

        <SidebarInset>
          <div className="p-4 pt-(--header-height)">
            <div className="grid grid-rows-[1fr] justify-items-center sm:p-8 gap-8 sm:gap-16 font-[family-name:var(--font-geist-sans)]">
              <h1 className="text-4xl font-bold pt-[20px]">Page Not Found</h1>

              <h2 className="text-2xl font-bold">
                Your eyes cannot pierce the overwhelming darkness. What you seek
                is not here.
              </h2>

              <Button
                variant="outline"
                className="absolute bottom-4 left-1/2 -translate-x-1/2"
                onClick={() => window.location.assign('/')}>
                Return Home
              </Button>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
