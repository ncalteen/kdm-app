'use client'

import { Collapsible } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { TabType } from '@/lib/enums'
import { LucideIcon } from 'lucide-react'
import { ReactElement } from 'react'

/**
 * Nav Main Properties
 */
interface NavMainProps {
  /** Navigation Items */
  items: {
    title: string
    tab: TabType
    icon?: LucideIcon
  }[]
  /** Selected Tab */
  selectedTab: TabType
  /** Set Selected Tab */
  setSelectedTab: (tab: TabType) => void
}

/**
 * Main Navigation Component
 *
 * @param props Main Navigation Properties
 * @returns Main Navigation Component
 */
export function NavMain({
  items,
  selectedTab,
  setSelectedTab
}: NavMainProps): ReactElement {
  return (
    <SidebarGroup>
      <SidebarMenu className="group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:items-center">
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={selectedTab === item.tab}
            className="group/collapsible">
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={item.title}
                aria-current={selectedTab === item.tab ? 'page' : undefined}
                onClick={() => setSelectedTab(item.tab)}
                className={
                  selectedTab === item.tab
                    ? 'bg-accent text-accent-foreground'
                    : ''
                }>
                {item.icon && <item.icon className="h-4 w-4" />}
                <span className="text-xs">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
