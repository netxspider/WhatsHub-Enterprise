import { create } from 'zustand'
import { Contact } from '@/types'

interface ContactsState {
    selectedContact: Contact | null
    setSelectedContact: (contact: Contact | null) => void
    searchQuery: string
    setSearchQuery: (query: string) => void
    selectedTags: string[]
    setSelectedTags: (tags: string[]) => void
}

export const useContactsStore = create<ContactsState>()((set) => ({
    selectedContact: null,
    setSelectedContact: (contact) => set({ selectedContact: contact }),
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),
    selectedTags: [],
    setSelectedTags: (tags) => set({ selectedTags: tags }),
}))
