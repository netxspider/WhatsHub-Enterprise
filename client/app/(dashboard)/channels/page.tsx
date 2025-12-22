'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, MoreVertical, Send, CheckCircle2, Users, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'

interface Channel {
    id: string
    name: string
    description: string
    creator_id: string
    followers_count: number
    verified: boolean
    created_at: string
    is_following: boolean
    is_creator: boolean
}

interface ChannelMessage {
    id: string
    channel_id: string
    content: string
    media_url?: string
    created_at: string
}

export default function ChannelsPage() {
    const [channels, setChannels] = useState<Channel[]>([])
    const [followingChannels, setFollowingChannels] = useState<Channel[]>([])
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null)
    const [messages, setMessages] = useState<ChannelMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newChannelName, setNewChannelName] = useState('')
    const [newChannelDesc, setNewChannelDesc] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchChannels()
        fetchFollowingChannels()
    }, [])

    useEffect(() => {
        if (selectedChannel) {
            fetchMessages(selectedChannel.id)
        }
    }, [selectedChannel])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchChannels = async () => {
        try {
            const data = await api.get('/channels/', { params: { search: searchQuery } })
            setChannels(data.data)
        } catch (error) {
            console.error('Failed to fetch channels:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchFollowingChannels = async () => {
        try {
            const data = await api.get('/channels/following')
            setFollowingChannels(data.data)
        } catch (error) {
            console.error('Failed to fetch following channels:', error)
        }
    }

    const fetchMessages = async (channelId: string) => {
        try {
            const data = await api.get(`/channels/${channelId}/messages`)
            setMessages(data.data)
        } catch (error) {
            console.error('Failed to fetch messages:', error)
        }
    }

    const handleFollow = async (channelId: string) => {
        try {
            await api.post(`/channels/${channelId}/follow`)
            await fetchChannels()
            await fetchFollowingChannels()
        } catch (error) {
            console.error('Failed to follow channel:', error)
        }
    }

    const handleUnfollow = async (channelId: string) => {
        try {
            await api.delete(`/channels/${channelId}/unfollow`)
            await fetchChannels()
            await fetchFollowingChannels()
        } catch (error) {
            console.error('Failed to unfollow channel:', error)
        }
    }

    const handleCreateChannel = async () => {
        if (!newChannelName.trim()) {
            alert('Please enter a channel name')
            return
        }

        try {
            await api.post('/channels/', {
                name: newChannelName.trim(),
                description: newChannelDesc.trim()
            })
            setShowCreateModal(false)
            setNewChannelName('')
            setNewChannelDesc('')
            await fetchChannels()
            await fetchFollowingChannels()
        } catch (error: any) {
            alert(error?.response?.data?.detail || 'Failed to create channel')
        }
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedChannel) return

        try {
            await api.post(`/channels/${selectedChannel.id}/messages`, {
                content: newMessage.trim()
            })
            setNewMessage('')
            await fetchMessages(selectedChannel.id)
        } catch (error: any) {
            alert(error?.response?.data?.detail || 'Failed to send message')
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    const discoveryChannels = channels.filter(c => !c.is_following && !c.is_creator)

    return (
        <div className="h-screen flex">
            {/* Left Sidebar - Hidden on mobile when viewing channel */}
            <div className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] backdrop-blur-sm flex flex-col ${selectedChannel ? 'hidden md:flex' : 'flex'
                }`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Channels</h1>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search"
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchChannels()}
                        />
                    </div>
                </div>

                {/* Channel Lists */}
                <div className="flex-1 overflow-y-auto">
                    {/* User's Channels */}
                    {followingChannels.filter(c => c.is_creator).length > 0 && (
                        <div className="border-b border-gray-200 dark:border-gray-700">
                            {followingChannels.filter(c => c.is_creator).map(channel => (
                                <div
                                    key={channel.id}
                                    onClick={() => setSelectedChannel(channel)}
                                    className={`p-4 cursor-pointer transition-colors ${selectedChannel?.id === channel.id
                                        ? 'bg-gray-100 dark:bg-gray-700'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                            {getInitials(channel.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold truncate">{channel.name}</h3>
                                                {channel.verified && (
                                                    <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{formatTime(channel.created_at)}</p>
                                            <p className="text-xs text-gray-400 mt-1">The channel "{channel.name}" was created</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Find Channels to Follow */}
                    {discoveryChannels.length > 0 && (
                        <div>
                            <h2 className="text-sm font-semibold text-gray-500 px-4 py-2 bg-gray-50 dark:bg-gray-750">
                                Find channels to follow
                            </h2>
                            {discoveryChannels.map(channel => (
                                <div
                                    key={channel.id}
                                    onClick={() => setSelectedChannel(channel)}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${selectedChannel?.id === channel.id
                                        ? 'bg-gray-100 dark:bg-gray-700'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                            {getInitials(channel.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold truncate">{channel.name}</h3>
                                                    {channel.verified && (
                                                        <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                    )}
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleFollow(channel.id)
                                                    }}
                                                    className="text-xs"
                                                >
                                                    Follow
                                                </Button>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                {channel.followers_count.toLocaleString()} followers
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Discover More */}
                    <button className="w-full p-4 text-left text-green-600 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center gap-2 text-sm font-medium">
                        <div className="h-2 w-2 bg-green-600 rounded-full"></div>
                        Discover more
                    </button>

                    {/* Create Channel */}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full p-4 text-left text-green-600 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center gap-2 text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Create channel
                    </button>
                </div>
            </div>

            {/* Right Panel */}
            {selectedChannel ? (
                <div className="flex-1 flex flex-col bg-white/95 backdrop-blur-sm">
                    {/* Channel Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3">
                        {/* Back button for mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden"
                            onClick={() => setSelectedChannel(null)}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold">
                            {getInitials(selectedChannel.name)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold">{selectedChannel.name}</h2>
                                {selectedChannel.verified && (
                                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                )}
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {selectedChannel.followers_count.toLocaleString()} followers
                            </p>
                        </div>
                        {!selectedChannel.is_creator && (
                            <Button
                                size="sm"
                                variant={selectedChannel.is_following ? "secondary" : "default"}
                                onClick={() => selectedChannel.is_following
                                    ? handleUnfollow(selectedChannel.id)
                                    : handleFollow(selectedChannel.id)
                                }
                            >
                                {selectedChannel.is_following ? 'Following' : 'Follow'}
                            </Button>
                        )}
                        <Button variant="ghost" size="sm">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No messages yet
                            </div>
                        ) : (
                            <div className="space-y-2 max-w-3xl mx-auto">
                                {messages.map(message => (
                                    <div key={message.id} className="flex justify-start">
                                        <div className="bg-white dark:bg-gray-700 rounded-lg px-4 py-2 max-w-[70%]">
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

                    {/* Message Input (Creator Only) */}
                    {selectedChannel.is_creator && (
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
                    )}
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                            <svg className="h-16 w-16 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Discover channels
                        </h2>
                        <p className="text-gray-500">
                            Entertainment, sports, news, lifestyle, people and more. Follow the channels that interest you
                        </p>
                    </div>
                </div>
            )}

            {/* Create Channel Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="bg-white dark:bg-gray-800 p-6 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4">Create Channel</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Channel Name</label>
                                <Input
                                    placeholder="e.g., Daily Motivation"
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description (optional)</label>
                                <Input
                                    placeholder="What's your channel about?"
                                    value={newChannelDesc}
                                    onChange={(e) => setNewChannelDesc(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateModal(false)
                                        setNewChannelName('')
                                        setNewChannelDesc('')
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateChannel}
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
