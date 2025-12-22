'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, MoreVertical, Users, Send, Plus, Hash, Lock, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'

interface Group {
    id: string
    name: string
    description: string
    community_id?: string
    creator_id: string
    members_count: number
    created_at: string
}

interface Community {
    id: string
    name: string
    description: string
    creator_id: string
    announcement_group_id: string
    members_count: number
    created_at: string
    groups: Group[]
    is_member: boolean
    is_admin: boolean
}

interface GroupMessage {
    id: string
    group_id: string
    user_id: string
    user_name: string
    content: string
    media_url?: string
    created_at: string
}

export default function CommunitiesPage() {
    const [communities, setCommunities] = useState<Community[]>([])
    const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
    const [messages, setMessages] = useState<GroupMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [showCreateCommunityModal, setShowCreateCommunityModal] = useState(false)
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
    const [newCommunityName, setNewCommunityName] = useState('')
    const [newCommunityDesc, setNewCommunityDesc] = useState('')
    const [newGroupName, setNewGroupName] = useState('')
    const [newGroupDesc, setNewGroupDesc] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchCommunities()
    }, [])

    useEffect(() => {
        if (selectedGroup) {
            fetchMessages(selectedGroup.id)
        }
    }, [selectedGroup])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchCommunities = async () => {
        try {
            const data = await api.get('/communities/')
            setCommunities(data.data)
            setLoading(false)
        } catch (error) {
            console.error('Failed to fetch communities:', error)
            setLoading(false)
        }
    }

    const fetchMessages = async (groupId: string) => {
        try {
            const data = await api.get(`/communities/groups/${groupId}/messages`)
            setMessages(data.data)
        } catch (error) {
            console.error('Failed to fetch messages:', error)
        }
    }

    const handleCreateCommunity = async () => {
        if (!newCommunityName.trim()) {
            alert('Please enter a community name')
            return
        }

        try {
            await api.post('/communities/', {
                name: newCommunityName.trim(),
                description: newCommunityDesc.trim()
            })
            setShowCreateCommunityModal(false)
            setNewCommunityName('')
            setNewCommunityDesc('')
            await fetchCommunities()
        } catch (error: any) {
            alert(error?.response?.data?.detail || 'Failed to create community')
        }
    }

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || !selectedCommunity) {
            alert('Please enter a group name')
            return
        }

        try {
            await api.post(`/communities/${selectedCommunity.id}/groups`, {
                name: newGroupName.trim(),
                description: newGroupDesc.trim()
            })
            setShowCreateGroupModal(false)
            setNewGroupName('')
            setNewGroupDesc('')
            await fetchCommunities()
        } catch (error: any) {
            alert(error?.response?.data?.detail || 'Failed to create group')
        }
    }

    const handleJoinGroup = async (groupId: string) => {
        try {
            await api.post(`/communities/groups/${groupId}/join`)
            await fetchCommunities()
        } catch (error: any) {
            alert(error?.response?.data?.detail || 'Failed to join group')
        }
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedGroup) return

        try {
            await api.post(`/communities/groups/${selectedGroup.id}/messages`, {
                content: newMessage.trim()
            })
            setNewMessage('')
            await fetchMessages(selectedGroup.id)
        } catch (error: any) {
            alert(error?.response?.data?.detail || 'Failed to send message')
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))

        if (hours < 24) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        }
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="h-screen flex">
            {/* Left Sidebar - Communities List - Hidden on mobile when community/group selected */}
            <div className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] backdrop-blur-sm flex flex-col ${selectedCommunity ? 'hidden md:flex' : 'flex'
                }`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Communities</h1>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCreateCommunityModal(true)}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="p-4 text-center text-gray-500">Loading communities...</div>
                    )}

                    {!loading && communities.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <p className="mb-2">No communities yet</p>
                            <p className="text-sm">Create a community to get started</p>
                        </div>
                    )}

                    {communities.map((community) => {
                        return (
                            <div
                                key={community.id}
                                onClick={() => {
                                    setSelectedCommunity(community)
                                    setSelectedGroup(null)
                                }}
                                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${selectedCommunity?.id === community.id
                                    ? 'bg-gray-100 dark:bg-gray-700'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                                    }`}
                            >
                                <div className="flex gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {getInitials(community.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold truncate">{community.name}</h3>
                                        <p className="text-xs text-gray-500">{community.groups.length} groups</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {community.members_count} members
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <button
                    onClick={() => setShowCreateCommunityModal(true)}
                    className="p-4 border-t border-gray-200 dark:border-gray-700 text-green-600 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center gap-2 font-medium"
                >
                    <Plus className="h-4 w-4" />
                    Create community
                </button>
            </div>

            {/* Middle Panel - Groups List */}
            {selectedCommunity && !selectedGroup ? (
                <div className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] backdrop-blur-sm flex flex-col ${selectedGroup ? 'hidden md:flex' : 'flex'
                    }`}>
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            {/* Back button for mobile */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden"
                                onClick={() => setSelectedCommunity(null)}
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>

                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                {getInitials(selectedCommunity.name)}
                            </div>
                            <div className="flex-1">
                                <h2 className="font-bold">{selectedCommunity.name}</h2>
                                <p className="text-xs text-gray-500">{selectedCommunity.members_count} members</p>
                            </div>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </div>
                        {selectedCommunity.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {selectedCommunity.description}
                            </p>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <h3 className="text-xs font-semibold text-gray-500 px-4 py-2 bg-gray-50 dark:bg-gray-750">
                            Groups
                        </h3>

                        {selectedCommunity.groups.map(group => {
                            const isAnnouncement = group.id === selectedCommunity.announcement_group_id

                            return (
                                <div
                                    key={group.id}
                                    onClick={() => setSelectedGroup(group)}
                                    className="p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isAnnouncement
                                            ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                            }`}>
                                            {isAnnouncement ? <Lock className="h-5 w-5" /> : <Hash className="h-5 w-5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold truncate">{group.name}</h4>
                                            <p className="text-xs text-gray-500">{group.members_count} members</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {selectedCommunity.is_admin && (
                        <button
                            onClick={() => setShowCreateGroupModal(true)}
                            className="p-4 border-t border-gray-200 dark:border-gray-700 text-green-600 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center gap-2 font-medium"
                        >
                            <Plus className="h-4 w-4" />
                            Create group
                        </button>
                    )}
                </div>
            ) : selectedGroup ? (
                <div className="flex-1 flex flex-col bg-white/95 backdrop-blur-sm">
                    {/* Group Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedGroup(null)}
                        >
                            ←
                        </Button>
                        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
                            <Hash className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold">{selectedGroup.name}</h2>
                            <p className="text-xs text-gray-500">{selectedGroup.members_count} members</p>
                        </div>
                        <Button variant="ghost" size="sm">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-[#efeae2] dark:bg-gray-900 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0icGF0dGVybiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiPjxwYXRoIGQ9Ik0wIDUwIEwgNTAgMTAwIE0gNTAgMCBMIDEwMCA1MCIgc3Ryb2tlPSIjZDBkNWRkIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjcGF0dGVybikiLz48L3N2Zz4=')]">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No messages yet
                            </div>
                        ) : (
                            <div className="space-y-2 max-w-4xl mx-auto">
                                {messages.map(message => (
                                    <div key={message.id} className="flex justify-start">
                                        <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2 max-w-[70%] shadow-sm">
                                            <p className="text-xs font-semibold text-green-600 mb-1">{message.user_name}</p>
                                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type a message"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSendMessage()
                                    }
                                }}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                            <Users className="h-16 w-16 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {selectedCommunity ? 'Select  a group' : 'Select a community'}
                        </h2>
                        <p className="text-gray-500">
                            {selectedCommunity
                                ? 'Choose a group from the list to view messages'
                                : 'Choose a community to see its groups and start chatting'}
                        </p>
                    </div>
                </div>
            )}

            {/* Create Community Modal */}
            {showCreateCommunityModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="bg-white dark:bg-gray-800 p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Create Community</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Community Name</label>
                                <Input
                                    placeholder="e.g., Tech Enthusiasts"
                                    value={newCommunityName}
                                    onChange={(e) => setNewCommunityName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                                <Input
                                    placeholder="What's your community about?"
                                    value={newCommunityDesc}
                                    onChange={(e) => setNewCommunityDesc(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateCommunityModal(false)
                                        setNewCommunityName('')
                                        setNewCommunityDesc('')
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateCommunity}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    Create
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Create Group Modal */}
            {showCreateGroupModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="bg-white dark:bg-gray-800 p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Create Group</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Group Name</label>
                                <Input
                                    placeholder="e.g., General Discussion"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                                <Input
                                    placeholder="What's this group for?"
                                    value={newGroupDesc}
                                    onChange={(e) => setNewGroupDesc(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateGroupModal(false)
                                        setNewGroupName('')
                                        setNewGroupDesc('')
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateGroup}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    Create
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
