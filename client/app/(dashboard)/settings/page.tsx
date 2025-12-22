'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Search,
    Briefcase,
    Shield,
    Lock,
    MessageSquare,
    Bell,
    Keyboard,
    HelpCircle,
    LogOut,
    ChevronRight,
    User,
    Settings as SettingsIcon,
    Moon,
    Image as ImageIcon,
    Volume2,
    Zap,
    ArrowLeft
} from 'lucide-react'
import { api } from '@/lib/api'

interface SettingItem {
    id: string
    title: string
    description: string
    icon: any
    category: string
}

export default function SettingsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSetting, setSelectedSetting] = useState<SettingItem | null>(null)
    const [user, setUser] = useState<any>(null)
    const [userStatus, setUserStatus] = useState('Available')
    const [loading, setLoading] = useState(true)
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

    useEffect(() => {
        fetchUserProfile()
    }, [])

    const fetchUserProfile = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user') || '{}')
            setUser(userData)
        } catch (error) {
            console.error('Failed to fetch user:', error)
        } finally {
            setLoading(false)
        }
    }

    const settingsCategories: SettingItem[] = [
        {
            id: 'business',
            title: 'Business tools',
            description: 'Quick replies, labels, catalog',
            icon: Briefcase,
            category: 'business'
        },
        {
            id: 'account',
            title: 'Account',
            description: 'Security notifications, account info',
            icon: Shield,
            category: 'account'
        },
        {
            id: 'privacy',
            title: 'Privacy',
            description: 'Blocked contacts, disappearing messages',
            icon: Lock,
            category: 'privacy'
        },
        {
            id: 'chats',
            title: 'Chats',
            description: 'Theme, wallpaper, chat settings',
            icon: MessageSquare,
            category: 'chats'
        },
        {
            id: 'notifications',
            title: 'Notifications',
            description: 'Message notifications',
            icon: Bell,
            category: 'notifications'
        },
        {
            id: 'shortcuts',
            title: 'Keyboard shortcuts',
            description: 'Quick actions',
            icon: Keyboard,
            category: 'shortcuts'
        },
        {
            id: 'help',
            title: 'Help and feedback',
            description: 'Help centre, contact us, privacy policy',
            icon: HelpCircle,
            category: 'help'
        }
    ]

    const filteredSettings = settingsCategories.filter(setting =>
        setting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        setting.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleLogout = () => {
        setLogoutDialogOpen(true)
    }

    const confirmLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
    }

    const getInitials = (name: string) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="h-screen flex">
            {/* Left Sidebar - Hidden on mobile when viewing setting */}
            <div className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] backdrop-blur-sm flex flex-col ${selectedSetting ? 'hidden md:flex' : 'flex'
                }`}>
                {/* Header */}
                <div className="p-4">
                    <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Settings</h1>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search settings"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* User Profile */}
                <div className="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-xl">
                            {user ? getInitials(user.name || user.email) : 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-semibold text-lg truncate text-gray-900 dark:text-white">
                                {user?.name || user?.email || 'User'}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{userStatus}</p>
                        </div>
                    </div>
                </div>

                {/* Settings List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredSettings.map((setting) => {
                        const Icon = setting.icon
                        return (
                            <div
                                key={setting.id}
                                onClick={() => setSelectedSetting(setting)}
                                className={`px-4 py-4 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedSetting?.id === setting.id ? 'bg-gray-200 dark:bg-gray-800' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0">
                                        <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 dark:text-white">{setting.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{setting.description}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                </div>
                            </div>
                        )
                    })}

                    {/* Logout */}
                    <div
                        onClick={handleLogout}
                        className="px-4 py-4 cursor-pointer transition-colors hover:bg-red-900/20 border-t border-gray-700 mt-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <LogOut className="h-6 w-6 text-red-500" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-red-500">Log out</h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            {selectedSetting ? (
                <div className="flex-1 p-8 overflow-y-auto bg-white dark:bg-[#1e1e1e]">
                    <div className="max-w-4xl">
                        {/* Back button for mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden mb-4"
                            onClick={() => setSelectedSetting(null)}
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" /> Back
                        </Button>

                        {/* Setting Header */}
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{selectedSetting.title}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{selectedSetting.description}</p>
                        </div>

                        {/* Setting Content based on category */}
                        {selectedSetting.id === 'business' && (
                            <div className="space-y-6">
                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Replies</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Save time by creating shortcuts for frequently sent messages
                                    </p>
                                    <Button>Manage Quick Replies</Button>
                                </Card>

                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Labels</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Organize your conversations with custom labels
                                    </p>
                                    <Button>Manage Labels</Button>
                                </Card>

                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Product Catalog</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Showcase your products and services to customers
                                    </p>
                                    <Button>Manage Catalog</Button>
                                </Card>
                            </div>
                        )}

                        {selectedSetting.id === 'account' && (
                            <div className="space-y-6">
                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name</label>
                                            <Input value={user?.name || ''} disabled />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                                            <Input value={user?.email || ''} disabled />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">About</label>
                                            <Input placeholder="Hey there! I am using WhatsHub" />
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Security</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded cursor-pointer">
                                            <span className="text-gray-900 dark:text-white">Two-step verification</span>
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                        <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded cursor-pointer">
                                            <span className="text-gray-900 dark:text-white">Change password</span>
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                        <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded cursor-pointer">
                                            <span className="text-gray-900 dark:text-white">Security notifications</span>
                                            <Badge variant="secondary">On</Badge>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {selectedSetting.id === 'privacy' && (
                            <div className="space-y-6">
                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Who can see my personal info</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded cursor-pointer">
                                            <span className="text-gray-900 dark:text-white">Last seen and online</span>
                                            <span className="text-gray-500 dark:text-gray-400">Everyone</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded cursor-pointer">
                                            <span className="text-gray-900 dark:text-white">Profile photo</span>
                                            <span className="text-gray-500 dark:text-gray-400">Everyone</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded cursor-pointer">
                                            <span className="text-gray-900 dark:text-white">About</span>
                                            <span className="text-gray-500 dark:text-gray-400">Everyone</span>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Disappearing messages</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Messages will disappear after the selected duration
                                    </p>
                                    <div className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start">24 hours</Button>
                                        <Button variant="outline" className="w-full justify-start">7 days</Button>
                                        <Button variant="outline" className="w-full justify-start">90 days</Button>
                                    </div>
                                </Card>

                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Blocked contacts</h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        0 blocked contacts
                                    </p>
                                    <Button variant="outline">Manage Blocked Contacts</Button>
                                </Card>
                            </div>
                        )}

                        {selectedSetting.id === 'chats' && (
                            <div className="space-y-6">
                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Moon className="h-5 w-5" />
                                        Theme
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="border-2 border-green-500 rounded-lg p-4 cursor-pointer">
                                            <div className="h-20 bg-white border rounded mb-2"></div>
                                            <p className="text-center font-medium text-gray-900 dark:text-white">Light</p>
                                        </div>
                                        <div className="border-2 border-transparent hover:border-gray-300 rounded-lg p-4 cursor-pointer">
                                            <div className="h-20 bg-gray-900 rounded mb-2"></div>
                                            <p className="text-center font-medium text-gray-900 dark:text-white">Dark</p>
                                        </div>
                                        <div className="border-2 border-transparent hover:border-gray-300 rounded-lg p-4 cursor-pointer">
                                            <div className="h-20 bg-gradient-to-br from-gray-100 to-gray-900 rounded mb-2"></div>
                                            <p className="text-center font-medium text-gray-900 dark:text-white">System</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5" />
                                        Wallpaper
                                    </h3>
                                    <Button>Change Wallpaper</Button>
                                </Card>

                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Chat Settings</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-900 dark:text-white">Enter is send</span>
                                            <input type="checkbox" className="toggle" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-900 dark:text-white">Media visibility</span>
                                            <input type="checkbox" className="toggle" defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-900 dark:text-white">Font size</span>
                                            <select className="border rounded px-3 py-1">
                                                <option>Small</option>
                                                <option>Medium</option>
                                                <option>Large</option>
                                            </select>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {selectedSetting.id === 'notifications' && (
                            <div className="space-y-6">
                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Message notifications</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-900 dark:text-white">Show notifications</span>
                                            <input type="checkbox" className="toggle" defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-900 dark:text-white">Show preview</span>
                                            <input type="checkbox" className="toggle" defaultChecked />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">Sounds</p>
                                                <p className="text-sm text-gray-500">Play sound for new messages</p>
                                            </div>
                                            <input type="checkbox" className="toggle" defaultChecked />
                                        </div>
                                    </div>
                                </Card>

                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Desktop notifications</h3>
                                    <div className="space-y-3">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Volume2 className="h-4 w-4 mr-2" />
                                            Notification sound
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {selectedSetting.id === 'shortcuts' && (
                            <div className="space-y-6">
                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Keyboard Shortcuts</h3>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'Ctrl + N', action: 'New chat' },
                                            { key: 'Ctrl + Shift + ]', action: 'Next chat' },
                                            { key: 'Ctrl + Shift + [', action: 'Previous chat' },
                                            { key: 'Ctrl + E', action: 'Archive chat' },
                                            { key: 'Ctrl + Shift + M', action: 'Mute chat' },
                                            { key: 'Ctrl + Backspace', action: 'Delete chat' },
                                            { key: 'Ctrl + Shift + U', action: 'Mark as unread' },
                                            { key: 'Ctrl + Shift + N', action: 'New group' },
                                        ].map((shortcut, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded">
                                                <span className="text-gray-900 dark:text-white">{shortcut.action}</span>
                                                <Badge variant="outline" className="font-mono">{shortcut.key}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        )}

                        {selectedSetting.id === 'help' && (
                            <div className="space-y-6">
                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Get Help</h3>
                                    <div className="space-y-3">
                                        <Button variant="outline" className="w-full justify-start">
                                            Help Centre
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            Contact Us
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            Terms and Privacy Policy
                                        </Button>
                                    </div>
                                </Card>

                                <Card className="p-6 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">App Info</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>Version: 1.0.0</p>
                                        <p>Build: 2024.12.19</p>
                                        <p>© 2024 WhatsHub Enterprise</p>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <div className="h-32 w-32 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <SettingsIcon className="h-16 w-16 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                            Settings
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            Select a setting from the left panel to view details
                        </p>
                    </div>
                </div>
            )}

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
        </div>
    )
}
