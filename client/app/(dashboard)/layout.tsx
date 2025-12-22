'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/auth'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import GridHoverEffect from '@/components/effects/GridHoverEffect'
import ThemeToggler from '@/components/ThemeToggler'
import {
    IconLayoutDashboard,
    IconUsers,
    IconMessage,
    IconSend,
    IconFileText,
    IconLogout,
    IconSettings
} from '@tabler/icons-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const { isAuthenticated, user, logout, token } = useAuthStore()
    const [open, setOpen] = useState(false)
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
    const pathname = usePathname()

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
        setLogoutDialogOpen(true)
    }

    const confirmLogout = () => {
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
        <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-gray-50 dark:bg-neutral-900">
            {/* Grid Hover Effect Background - Lowest z-index */}
            <div className="absolute inset-0 z-0">
                <GridHoverEffect />
            </div>

            {/* Logout Confirmation Dialog */}
            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Logout</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to log out? You'll need to sign in again to access your account.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setLogoutDialogOpen(false)}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmLogout}
                            className="w-full sm:w-auto"
                        >
                            Log Out
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Sidebar - Only show on desktop */}
            <div className="hidden md:block relative z-10">
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
                            {/* Theme Toggler - Circular like profile icon */}
                            <div className="mb-3 flex justify-start">
                                <ThemeToggler variant="icon" />
                            </div>

                            <SidebarLink
                                link={{
                                    label: user?.name || 'User',
                                    href: '/profile',
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
            </div>

            {/* Mobile Navigation - Only show on mobile */}
            <div className="md:hidden w-full relative z-10">
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
                            {/* Theme Toggler */}
                            <div className="mb-3 px-2">
                                <ThemeToggler variant="toggle" />
                            </div>

                            <SidebarLink
                                link={{
                                    label: user?.name || 'User',
                                    href: '/profile',
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
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-auto relative z-[5]">
                <div className="h-full w-full">
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
