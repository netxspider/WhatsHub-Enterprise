'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AnimatedList, { AnimatedItem } from '@/components/AnimatedList'
import {
    Search,
    X,
    UserPlus,
    Users,
    MessageSquare,
    Loader2,
    AlertCircle
} from 'lucide-react'
import { api } from '@/lib/api'

interface Contact {
    id: string
    name: string
    phone: string
    email?: string
    tags?: string[]
}

interface ChatThread {
    id: string
    contact_id: string
    contact_name: string
    contact_phone: string
    last_message: string | null
    unread_count: number
    updated_at: string
}

interface ContactsSidebarProps {
    onClose: () => void
    onContactSelect: (contactId: string) => void
}

export default function ContactsSidebar({ onClose, onContactSelect }: ContactsSidebarProps) {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [threads, setThreads] = useState<ChatThread[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [newContactName, setNewContactName] = useState('')
    const [newContactEmail, setNewContactEmail] = useState('')
    const [newContactPhone, setNewContactPhone] = useState('')
    const [adding, setAdding] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        setError('') // Clear previous errors
        try {
            const [contactsData, threadsData] = await Promise.all([
                api.getContacts({ limit: 500 }),
                api.getChatThreads(100).catch(() => []) // Handle case where no threads exist
            ])

            console.log('Loaded contacts count:', contactsData?.length)
            console.log('Sample contact IDs:', contactsData?.slice(0, 3).map((c: any) => ({ name: c.name, id: c.id })))

            setContacts(contactsData || [])
            setThreads(threadsData || [])
        } catch (error: any) {
            console.error('Failed to fetch contacts:', error)

            // More specific error messaging
            if (error.response?.status === 403) {
                setError('You don\'t have permission to view contacts. Please check if you\'re logged in.')
            } else if (error.response?.status === 401) {
                setError('Your session has expired. Please log in again.')
            } else {
                setError(error.response?.data?.detail || 'Failed to load contacts. Please try again.')
            }

            setContacts([])
            setThreads([])
        } finally {
            setLoading(false)
        }
    }

    const handleAddContact = async () => {
        // Validate inputs
        if (!newContactName.trim()) {
            setError('Name is required')
            return
        }

        if (!newContactEmail.trim()) {
            setError('Email is required')
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(newContactEmail.trim())) {
            setError('Please enter a valid email address')
            return
        }

        setAdding(true)
        setError('')

        try {
            const contactData: any = {
                name: newContactName.trim(),
                email: newContactEmail.trim(),
                tags: ['chat']
            }

            // Add phone if provided
            if (newContactPhone.trim()) {
                contactData.phone = newContactPhone.trim()
            } else {
                // Use email as phone if not provided (for backend compatibility)
                contactData.phone = newContactEmail.trim()
            }

            const newContact = await api.createContact(contactData)

            // Add to contacts list at the top
            setContacts([newContact, ...contacts])

            // Reset form
            setNewContactName('')
            setNewContactEmail('')
            setNewContactPhone('')
            setShowAddForm(false)

            // Select the new contact
            onContactSelect(newContact.id)
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || 'Failed to create contact'
            setError(errorMessage)
            console.error('Error creating contact:', err)
        } finally {
            setAdding(false)
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    // Filter contacts
    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.phone.includes(searchQuery) ||
        (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Separate contacts into recently communicated and others
    const threadContactIds = new Set(threads.map(t => t.contact_id))
    const recentContacts = filteredContacts.filter(c => threadContactIds.has(c.id))
    const otherContacts = filteredContacts.filter(c => !threadContactIds.has(c.id))

    return (
        <div className="w-full md:w-96 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] flex flex-col h-screen">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Contacts</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search contacts..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Add Contact Button */}
                <Button
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => setShowAddForm(!showAddForm)}
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Contact
                </Button>
            </div>

            {/* Add Contact Form */}
            {showAddForm && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <h3 className="font-semibold mb-3">New Contact</h3>

                    <div className="space-y-2">
                        <Input
                            placeholder="Name *"
                            value={newContactName}
                            onChange={(e) => setNewContactName(e.target.value)}
                        />
                        <Input
                            type="email"
                            placeholder="Email *"
                            value={newContactEmail}
                            onChange={(e) => setNewContactEmail(e.target.value)}
                        />
                        <Input
                            placeholder="Phone (optional)"
                            value={newContactPhone}
                            onChange={(e) => setNewContactPhone(e.target.value)}
                        />

                        {error && (
                            <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={handleAddContact}
                                disabled={adding}
                            >
                                {adding ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    'Add & Chat'
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setShowAddForm(false)
                                    setNewContactName('')
                                    setNewContactEmail('')
                                    setNewContactPhone('')
                                    setError('')
                                }}
                                disabled={adding}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Contacts List */}
            <div className="flex-1 overflow-hidden">
                {loading ? (
                    <div className="p-4 text-center text-gray-500">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading contacts...
                    </div>
                ) : error && contacts.length === 0 ? (
                    <div className="p-4 text-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="mt-2"
                            onClick={fetchData}
                        >
                            Retry
                        </Button>
                    </div>
                ) : filteredContacts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        {searchQuery ? 'No contacts found' : 'No contacts yet. Add one to get started!'}
                    </div>
                ) : (
                    <AnimatedList
                        className="h-full"
                        displayScrollbar={true}
                        showGradients={true}
                    >
                        <div className="p-4 space-y-4">
                            {/* Recently Communicated */}
                            {recentContacts.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <MessageSquare className="h-4 w-4 text-gray-500" />
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                            Recent Chats
                                        </h3>
                                    </div>

                                    {recentContacts.map((contact, index) => (
                                        <div key={contact.id}>
                                            <AnimatedItem
                                                index={index}
                                                onClick={() => {
                                                    if (contact.id) {
                                                        onContactSelect(contact.id)
                                                    } else {
                                                        console.error('Contact ID is undefined:', contact)
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700">
                                                    <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                        {getInitials(contact.name)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold truncate">{contact.name}</h4>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {contact.email || contact.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </AnimatedItem>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* All Other Contacts */}
                            {otherContacts.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Users className="h-4 w-4 text-gray-500" />
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                            All Contacts
                                        </h3>
                                    </div>

                                    {otherContacts.map((contact, index) => (
                                        <div key={contact.id}>
                                            <AnimatedItem
                                                index={recentContacts.length + index}
                                                onClick={() => {
                                                    if (contact.id) {
                                                        onContactSelect(contact.id)
                                                    } else {
                                                        console.error('Contact ID is undefined:', contact)
                                                    }
                                                }}
                                            >
                                                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700">
                                                    <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                        {getInitials(contact.name)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-semibold truncate">{contact.name}</h4>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {contact.email || contact.phone}
                                                        </p>
                                                    </div>
                                                </div>
                                            </AnimatedItem>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </AnimatedList>
                )}
            </div>
        </div>
    )
}
