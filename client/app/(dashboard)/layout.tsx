'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import {
    IconLayoutDashboard,
    IconUsers,
    IconMessage,
    IconSend,
    IconFileText,
    IconLogout,
    IconSettings
} from '@tabler/icons-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const { isAuthenticated, user, logout, token } = useAuthStore()
    const [open, setOpen] = useState(false)

    useEffect(() => {
        // Small delay to allow Zustand to hydrate from localStorage
        const timer = setTimeout(() => {
            if (!isAuthenticated && !token) {
                router.push('/login')
            }
        }, 100)

        return () => clearTimeout(timer)
    }, [isAuthenticated, token, router])

    // Show loading while checking auth
    if (!isAuthenticated && !token) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        )
    }

    const handleLogout = () => {
        logout()
        router.push('/login')
    }

    const links = {
        main: [
            {
                label: 'Dashboard',
                href: '/dashboard',
                icon: <IconLayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            },
            {
                label: 'Contacts',
                href: '/contacts',
                icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            },
            {
                label: 'Campaigns',
                href: '/campaigns',
                icon: <IconSend className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            }
        ],
        communication: [
            {
                label: 'Chats',
                href: '/chat',
                icon: <IconMessage className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            },
            {
                label: 'Status',
                href: '/status',
                icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            },
            {
                label: 'Channels',
                href: '/channels',
                icon: <IconSend className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            },
            {
                label: 'Communities',
                href: '/communities',
                icon: <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            }
        ],
        settings: [
            {
                label: 'Templates',
                href: '/templates',
                icon: <IconFileText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            },
            {
                label: 'Settings',
                href: '/settings',
                icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
            }
        ]
    }

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-neutral-900">
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="justify-between gap-10">
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                        {/* Logo */}
                        {open ? <Logo /> : <LogoIcon />}

                        {/* Navigation Links - Section 1 */}
                        <div className="mt-8 flex flex-col gap-2">
                            {links.main.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>

                        {/* Separator */}
                        <div className="my-4 border-t border-neutral-300 dark:border-neutral-700" />

                        {/* Navigation Links - Section 2 */}
                        <div className="flex flex-col gap-2">
                            {links.communication.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>

                        {/* Separator */}
                        <div className="my-4 border-t border-neutral-300 dark:border-neutral-700" />

                        {/* Navigation Links - Section 3 */}
                        <div className="flex flex-col gap-2">
                            {links.settings.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>

                    {/* User Profile & Logout */}
                    <div>
                        <SidebarLink
                            link={{
                                label: user?.name || 'User',
                                href: '#',
                                icon: (
                                    <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                )
                            }}
                        />
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-start gap-3 group/sidebar py-2 px-2 w-full rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                            <IconLogout className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                            <motion.span
                                animate={{
                                    display: open ? "inline-block" : "none",
                                    opacity: open ? 1 : 0,
                                }}
                                className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                            >
                                Logout
                            </motion.span>
                        </button>
                    </div>
                </SidebarBody>
            </Sidebar>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto">
                <div className="h-full w-full bg-white dark:bg-neutral-900">
                    {children}
                </div>
            </div>
        </div>
    )
}

const Logo = () => {
    return (
        <a
            href="/dashboard"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white"
        >
            <div className="h-8 w-8 shrink-0 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col"
            >
                <span className="font-bold text-base whitespace-pre text-black dark:text-white">
                    WhatsHub
                </span>
                <span className="text-xs text-neutral-600 dark:text-neutral-400">
                    Enterprise
                </span>
            </motion.div>
        </a>
    )
}

const LogoIcon = () => {
    return (
        <a
            href="/dashboard"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black dark:text-white"
        >
            <div className="h-8 w-8 shrink-0 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
            </div>
        </a>
    )
}
