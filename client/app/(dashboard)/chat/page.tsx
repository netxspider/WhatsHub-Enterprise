'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import NewChatDialog from '@/components/NewChatDialog'
import ContactsSidebar from '@/components/ContactsSidebar'
import {
    Search,
    Plus,
    MoreVertical,
    Send,
    Check,
    CheckCheck,
    Clock,
    User,
    ArrowLeft
} from 'lucide-react'
import { api } from '@/lib/api'

interface ChatThread {
    id: string
    contact_id: string
    contact_name: string
    contact_phone: string
    last_message: string | null
    unread_count: number
    updated_at: string
}

interface Message {
    id: string
    thread_id: string
    direction: 'inbound' | 'outbound'
    content: string
    type: string
    status: 'sent' | 'delivered' | 'read' | 'failed'
    timestamp: string
}

export default function ChatPage() {
    const [threads, setThreads] = useState<ChatThread[]>([])
    const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [showNewChatDialog, setShowNewChatDialog] = useState(false)
    const [showContactsSidebar, setShowContactsSidebar] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchThreads()
    }, [])

    useEffect(() => {
        if (selectedThread) {
            fetchMessages(selectedThread.contact_id)
        }
    }, [selectedThread])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const fetchThreads = async () => {
        try {
            const data = await api.getChatThreads(50)
            setThreads(data || [])
        } catch (error: any) {
            console.error('Failed to fetch chat threads:', error)
            // Don't show error for 403 - user might not have any threads yet
            setThreads([])
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (contactId: string) => {
        try {
            const data = await api.getThreadMessages(contactId, 100)
            setMessages(data)
        } catch (error) {
            console.error('Failed to fetch messages:', error)
        }
    }

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedThread) return

        setSending(true)
        try {
            await api.sendMessage({
                contact_id: selectedThread.contact_id,
                content: newMessage.trim(),
                type: 'text'
            })
            setNewMessage('')
            await fetchMessages(selectedThread.contact_id)
        } catch (error: any) {
            console.error('Failed to send message:', error)
        } finally {
            setSending(false)
        }
    }

    const handleChatCreated = async (contactId: string) => {
        // Refresh threads to show the new chat
        await fetchThreads()
        // Find and select the new thread
        const thread = threads.find(t => t.contact_id === contactId)
        if (thread) {
            setSelectedThread(thread)
        }
    }

    const handleContactSelect = async (contactId: string) => {
        console.log('=== Contact Selected ===', contactId)

        // Validate contactId first
        if (!contactId || contactId === 'undefined' || contactId === 'null') {
            console.error('Invalid contact ID received:', contactId)
            return
        }

        // Close sidebar immediately
        setShowContactsSidebar(false)

        // Check if thread exists
        let thread = threads.find((t: any) => t.contact_id === contactId)
        console.log('Existing thread found:', thread)

        if (!thread) {
            console.log('No existing thread, creating new one...')
            // Fetch messages - this will create the thread
            await fetchMessages(contactId)

            // Get fresh threads
            const freshThreads = await api.getChatThreads(50)
            console.log('Fresh threads count:', freshThreads?.length)
            setThreads(freshThreads || [])

            thread = freshThreads?.find((t: any) => t.contact_id === contactId)
            console.log('Thread found after refresh:', thread)
        } else {
            console.log('Loading messages for existing thread')
            await fetchMessages(contactId)
        }

        if (thread) {
            console.log('Setting selected thread:', thread)
            setSelectedThread(thread)
        } else {
            console.log('Thread not found, creating temporary thread')
            // Create temp thread with contact info
            try {
                const contact = await api.getContact(contactId)
                console.log('Contact info:', contact)
                const tempThread = {
                    id: 'temp_' + contactId,
                    contact_id: contactId,
                    contact_name: contact.name,
                    contact_phone: contact.phone,
                    last_message: null,
                    unread_count: 0,
                    updated_at: new Date().toISOString()
                }
                console.log('Setting temp thread:', tempThread)
                setSelectedThread(tempThread)
            } catch (error) {
                console.error('Error creating temp thread:', error)
            }
        }

        console.log('=== Contact Selection Complete ===')
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const filteredThreads = threads.filter(thread => {
        const matchesSearch = thread.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            thread.contact_phone?.includes(searchQuery) ||
            false
        const matchesTab = activeTab === 'all' ||
            (activeTab === 'unread' && thread.unread_count > 0)
        return matchesSearch && matchesTab
    })

    const getMessageStatus = (status: string) => {
        switch (status) {
            case 'sent':
                return <Check className="h-3 w-3" />
            case 'delivered':
                return <CheckCheck className="h-3 w-3" />
            case 'read':
                return <CheckCheck className="h-3 w-3 text-blue-500" />
            case 'failed':
                return <Clock className="h-3 w-3 text-red-500" />
            default:
                return <Clock className="h-3 w-3" />
        }
    }

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="h-screen flex">
            {/* Left Panel - Contact List - Hidden on mobile when chat is selected */}
            <div className={`w-full md:w-96 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] backdrop-blur-sm flex flex-col ${selectedThread ? 'hidden md:flex' : 'flex'
                }`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-bold">Chats</h1>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setShowContactsSidebar(!showContactsSidebar)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search or start new chat"
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700">
                    {['all', 'unread', 'favourites', 'groups', 'labels'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTab === tab
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading chats...</div>
                    ) : filteredThreads.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No chats found</div>
                    ) : (
                        filteredThreads.map(thread => (
                            <div
                                key={thread.id}
                                onClick={() => setSelectedThread(thread)}
                                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${selectedThread?.id === thread.id
                                    ? 'bg-gray-100 dark:bg-gray-700'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                                    }`}
                            >
                                <div className="flex gap-3">
                                    {/* Avatar */}
                                    <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {getInitials(thread.contact_name)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-1">
                                            <h3 className="font-semibold truncate">{thread.contact_name}</h3>
                                            <span className="text-xs text-gray-500 flex-shrink-0">
                                                {formatTime(thread.updated_at)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                {thread.last_message || 'No messages yet'}
                                            </p>
                                            {thread.unread_count > 0 && (
                                                <Badge className="bg-green-600 text-white ml-2">{thread.unread_count}</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Middle Panel - Contacts Sidebar */}
            {showContactsSidebar && (
                <ContactsSidebar
                    onClose={() => setShowContactsSidebar(false)}
                    onContactSelect={handleContactSelect}
                />
            )}

            {/* Right Panel - Messages */}
            {selectedThread ? (
                <div className="flex-1 flex flex-col bg-white/95 backdrop-blur-sm">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3">
                        {/* Back button for mobile */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden"
                            onClick={() => setSelectedThread(null)}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>

                        <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
                            {getInitials(selectedThread.contact_name)}
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold">{selectedThread.contact_name}</h2>
                            <p className="text-xs text-gray-500">{selectedThread.contact_phone}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h20v20H0zm20 20h20v20H20z\' fill=\'%23e5e7eb\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")' }}>
                        {messages.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[70%] rounded-lg px-4 py-2 ${message.direction === 'outbound'
                                                ? 'bg-green-500 text-white'
                                                : 'bg-white dark:bg-gray-700'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-xs opacity-70">{formatTime(message.timestamp)}</span>
                                                {message.direction === 'outbound' && (
                                                    <span className="opacity-70">{getMessageStatus(message.status)}</span>
                                                )}
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
                                disabled={!newMessage.trim() || sending}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center">
                    <div className="text-center">
                        <User className="h-24 w-24 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            WhatsHub Enterprise
                        </h2>
                        <p className="text-gray-500">
                            Select a chat to start messaging
                        </p>
                    </div>
                </div>
            )}

            {/* New Chat Dialog */}
            <NewChatDialog
                open={showNewChatDialog}
                onOpenChange={setShowNewChatDialog}
                onChatCreated={handleChatCreated}
            />
        </div>
    )
}
