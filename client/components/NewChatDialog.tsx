'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

interface NewChatDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onChatCreated: (contactId: string) => void
}

export default function NewChatDialog({ open, onOpenChange, onChatCreated }: NewChatDialogProps) {
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [isCreatingContact, setIsCreatingContact] = useState(false)
    const [verificationResult, setVerificationResult] = useState<{
        registered: boolean
        user_id?: string
        name?: string
        email?: string
    } | null>(null)
    const [showAddContact, setShowAddContact] = useState(false)
    const [error, setError] = useState('')

    const handleVerifyEmail = async () => {
        if (!email.trim()) {
            setError('Please enter an email address')
            return
        }

        setIsVerifying(true)
        setError('')
        setVerificationResult(null)

        try {
            const response = await api.get(`/contacts/verify-email?email=${encodeURIComponent(email)}`)
            setVerificationResult(response.data)

            if (!response.data.registered) {
                setShowAddContact(true)
            } else {
                setName(response.data.name || '')
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to verify email')
        } finally {
            setIsVerifying(false)
        }
    }

    const handleCreateContact = async () => {
        if (!name.trim() || !phone.trim()) {
            setError('Name and phone are required')
            return
        }

        setIsCreatingContact(true)
        setError('')

        try {
            const response = await api.post('/contacts/', {
                name: name.trim(),
                phone: phone.trim(),
                tags: ['chat']
            })

            // Start chat with new contact
            onChatCreated(response.data.id)
            handleClose()
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create contact')
        } finally {
            setIsCreatingContact(false)
        }
    }

    const handleStartChat = () => {
        if (verificationResult?.user_id) {
            onChatCreated(verificationResult.user_id)
            handleClose()
        }
    }

    const handleClose = () => {
        setEmail('')
        setName('')
        setPhone('')
        setVerificationResult(null)
        setShowAddContact(false)
        setError('')
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Start New Chat</DialogTitle>
                    <DialogDescription>
                        Search for a registered user by email or add a new contact.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Email Search */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="flex gap-2">
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleVerifyEmail()}
                                disabled={isVerifying || verificationResult !== null}
                            />
                            {!verificationResult && (
                                <Button
                                    onClick={handleVerifyEmail}
                                    disabled={isVerifying || !email.trim()}
                                    size="icon"
                                >
                                    {isVerifying ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Search className="h-4 w-4" />
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Verification Result */}
                    {verificationResult && (
                        <div className={`p-3 rounded-lg border ${verificationResult.registered
                            ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                            }`}>
                            <div className="flex items-center gap-2">
                                {verificationResult.registered ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <p className="text-sm text-green-700 dark:text-green-300">
                                            User found: <strong>{verificationResult.name}</strong>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 text-red-600" />
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            User not registered. Add as contact to start chatting.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Add Contact Form */}
                    {showAddContact && (
                        <div className="space-y-3 pt-2 border-t">
                            <h3 className="font-semibold text-sm">Add New Contact</h3>

                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Contact name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="+1234567890"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg border bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>

                    {verificationResult?.registered ? (
                        <Button onClick={handleStartChat} className="bg-green-600 hover:bg-green-700">
                            Start Chat
                        </Button>
                    ) : showAddContact ? (
                        <Button
                            onClick={handleCreateContact}
                            disabled={isCreatingContact || !name.trim() || !phone.trim()}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isCreatingContact ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Add Contact & Chat'
                            )}
                        </Button>
                    ) : null}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
