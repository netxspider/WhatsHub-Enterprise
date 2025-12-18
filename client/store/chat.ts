import { create } from 'zustand'
import { Contact } from '@/types'

interface ChatState {
    activeContact: Contact | null
    setActiveContact: (contact: Contact | null) => void
}

export const useChatStore = create<ChatState>()((set) => ({
    activeContact: null,
    setActiveContact: (contact) => set({ activeContact: contact }),
}))
