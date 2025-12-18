export interface User {
    _id: string
    email: string
    name: string
    created_at: string
}

export interface Contact {
    _id: string
    user_id: string
    name: string
    phone: string
    tags: string[]
    source: 'manual' | 'sheet' | 'import'
    created_at: string
}

export interface ChatThread {
    _id: string
    contact_id: string
    user_id: string
    last_message: string | null
    unread_count: number
    updated_at: string
}

export interface Message {
    _id: string
    thread_id: string
    direction: 'outbound' | 'inbound'
    content: string
    type: 'text' | 'template' | 'image' | 'document'
    status: 'sent' | 'delivered' | 'read' | 'failed'
    timestamp: string
}

export interface Campaign {
    _id: string
    user_id: string
    name: string
    template_id: string | null
    status: 'draft' | 'active' | 'completed' | 'paused'
    total_contacts: number
    delivered_count: number
    read_count: number
    created_at: string
}

export interface CampaignStats {
    campaign_id: string
    total_contacts: number
    sent_count: number
    delivered_count: number
    read_count: number
    failed_count: number
}

export interface CampaignContact {
    contact_id: string
    name: string
    phone: string
    message_status: string
    sent_at: string | null
}

export interface Template {
    _id: string
    name: string
    category: 'marketing' | 'utility' | 'authentication' | 'transactional'
    content: string
    parameters: TemplateParameter[]
    status: 'approved' | 'pending' | 'rejected'
}

export interface TemplateParameter {
    name: string
    example: string
}
