'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, MoreVertical, Lock, Eye, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'

interface StatusUpdate {
    id: string
    contact_id: string
    contact_name: string
    contact_phone: string
    content: string
    media_url?: string
    media_type?: 'image' | 'video' | 'text'
    created_at: string
    viewed: boolean
    views_count: number
}

export default function StatusPage() {
    const [statuses, setStatuses] = useState<StatusUpdate[]>([])
    const [selectedStatus, setSelectedStatus] = useState<StatusUpdate | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStatuses()
    }, [])

    const fetchStatuses = async () => {
        try {
            // Fetch contacts and map to status updates
            // For now, contacts don't have status field, so we'll fetch contacts with recent activity
            const contacts = await api.getContacts({ limit: 50 })

            // Filter contacts that might have status (we can add status field to contacts later)
            // For now, show empty list since contacts don't have status updates
            const statusUpdates: StatusUpdate[] = []

            setStatuses(statusUpdates)
        } catch (error) {
            console.error('Failed to fetch statuses:', error)
        } finally {
            setLoading(false)
        }
    }

    const recentStatuses = statuses.filter(s => !s.viewed)
    const viewedStatuses = statuses.filter(s => s.viewed)

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))

        if (hours < 1) {
            const minutes = Math.floor(diff / (1000 * 60))
            return `${minutes}m ago`
        } else if (hours < 24) {
            return `Today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
        } else if (hours < 48) {
            return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const handleStatusClick = (status: StatusUpdate) => {
        setSelectedStatus(status)
        // Mark as viewed
        if (!status.viewed) {
            setStatuses(prev =>
                prev.map(s => s.id === status.id ? { ...s, viewed: true, views_count: s.views_count + 1 } : s)
            )
        }
    }

    return (
        <div className="h-screen flex">
            {/* Left Sidebar - Status List - Hidden on mobile when viewing status */}
            <div className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] backdrop-blur-sm flex flex-col ${selectedStatus ? 'hidden md:flex' : 'flex'
                }`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Status</h1>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                                <Plus className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Status List */}
                <div className="flex-1 overflow-y-auto">
                    {/* My Status */}
                    <div className="border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer">
                        <div className="flex gap-3">
                            <div className="relative">
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                    <Plus className="h-6 w-6" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold">My status</h3>
                                <p className="text-sm text-gray-500">Click to add status update</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Statuses */}
                    {recentStatuses.length > 0 && (
                        <div>
                            <h2 className="text-sm font-semibold text-gray-500 px-4 py-2 bg-gray-50 dark:bg-gray-750">
                                Recent
                            </h2>
                            {recentStatuses.map(status => (
                                <div
                                    key={status.id}
                                    onClick={() => handleStatusClick(status)}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${selectedStatus?.id === status.id
                                        ? 'bg-gray-100 dark:bg-gray-700'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        {/* Avatar with Ring */}
                                        <div className="relative">
                                            <div className="h-14 w-14 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold flex-shrink-0 ring-4 ring-green-500 ring-offset-2 dark:ring-offset-gray-800">
                                                {getInitials(status.contact_name)}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className="font-semibold">{status.contact_name}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500">{formatTime(status.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Viewed Statuses */}
                    {viewedStatuses.length > 0 && (
                        <div>
                            <h2 className="text-sm font-semibold text-gray-500 px-4 py-2 bg-gray-50 dark:bg-gray-750 flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                Viewed
                            </h2>
                            {viewedStatuses.map(status => (
                                <div
                                    key={status.id}
                                    onClick={() => handleStatusClick(status)}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors opacity-60 ${selectedStatus?.id === status.id
                                        ? 'bg-gray-100 dark:bg-gray-700'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        {/* Avatar (no ring for viewed) */}
                                        <div className="h-14 w-14 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                            {getInitials(status.contact_name)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <h3 className="font-semibold">{status.contact_name}</h3>
                                            </div>
                                            <p className="text-sm text-gray-500">{formatTime(status.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {loading && (
                        <div className="p-4 text-center text-gray-500">Loading statuses...</div>
                    )}
                    {!loading && statuses.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <p className="mb-2">No status updates yet</p>
                            <p className="text-sm">Status updates from your contacts will appear here</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Status Viewer - Hidden on mobile when nothing selected */}
            {selectedStatus ? (
                <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-sm text-white">
                    {/* Status Header */}
                    <div className="p-4 flex items-center gap-3 bg-black/20">
                        {/* Back button for mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden p-2 hover:bg-white/20"
                            onClick={() => setSelectedStatus(null)}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center font-semibold">
                            {getInitials(selectedStatus.contact_name)}
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold">{selectedStatus.contact_name}</h2>
                            <p className="text-sm opacity-75">{formatTime(selectedStatus.created_at)}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Status Content */}
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="max-w-2xl w-full">
                            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white p-8">
                                <p className="text-lg text-center whitespace-pre-wrap">{selectedStatus.content}</p>
                            </Card>
                        </div>
                    </div>

                    {/* Views Info */}
                    <div className="p-4 bg-black/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm">{selectedStatus.views_count} views</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs opacity-75">
                            <Lock className="h-3 w-3" />
                            <span>End-to-end encrypted</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="mb-6">
                            <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                                <svg className="h-16 w-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4M12 8h.01" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Share status updates
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Share photos, videos and text that disappear after 24 hours.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <Lock className="h-4 w-4" />
                            <span>Your status updates are end-to-end encrypted</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
