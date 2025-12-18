import axios, { AxiosInstance, AxiosError } from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class APIClient {
    private client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // Add auth token to requests
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('token')
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        })

        // Handle auth errors
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Clear token and redirect to login
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    window.location.href = '/login'
                }
                return Promise.reject(error)
            }
        )
    }

    // Auth
    async register(data: { email: string; name: string; password: string }) {
        const response = await this.client.post('/auth/register', data)
        return response.data
    }

    async login(data: { email: string; password: string }) {
        const response = await this.client.post('/auth/login', data)
        return response.data
    }

    async getCurrentUser() {
        const response = await this.client.get('/auth/me')
        return response.data
    }

    // Contacts
    async getContacts(params?: { search?: string; tags?: string; limit?: number }) {
        const response = await this.client.get('/contacts/', { params })
        return response.data
    }

    async getContact(id: string) {
        const response = await this.client.get(`/contacts/${id}`)
        return response.data
    }

    async createContact(data: { name: string; phone: string; tags?: string[]; source?: string }) {
        const response = await this.client.post('/contacts/', data)
        return response.data
    }

    async updateContact(id: string, data: { name?: string; phone?: string; tags?: string[] }) {
        const response = await this.client.put(`/contacts/${id}`, data)
        return response.data
    }

    async deleteContact(id: string) {
        await this.client.delete(`/contacts/${id}`)
    }

    async getAllTags() {
        const response = await this.client.get('/contacts/tags/all')
        return response.data
    }

    // Chat
    async getChatThreads(limit?: number) {
        const response = await this.client.get('/chat/threads', { params: { limit } })
        return response.data
    }

    async getThreadMessages(contactId: string, limit?: number) {
        const response = await this.client.get(`/chat/threads/${contactId}/messages`, { params: { limit } })
        return response.data
    }

    async sendMessage(data: { contact_id: string; content: string; type?: string }) {
        const response = await this.client.post('/chat/send', data)
        return response.data
    }

    async sendTemplate(data: { contact_id: string; template_id: string; parameters: Record<string, string> }) {
        const response = await this.client.post('/chat/send-template', data)
        return response.data
    }

    // Campaigns
    async getCampaigns(limit?: number) {
        const response = await this.client.get('/campaigns/', { params: { limit } })
        return response.data
    }

    async getCampaign(id: string) {
        const response = await this.client.get(`/campaigns/${id}`)
        return response.data
    }

    async createCampaign(data: {
        name: string
        sheet_url: string
        sheet_name?: string
        template_id?: string
        template_parameters?: Record<string, string>
    }) {
        const response = await this.client.post('/campaigns/', data)
        return response.data
    }

    async getCampaignStats(id: string) {
        const response = await this.client.get(`/campaigns/${id}/stats`)
        return response.data
    }

    async getCampaignContacts(id: string) {
        const response = await this.client.get(`/campaigns/${id}/contacts`)
        return response.data
    }

    // Templates
    async getTemplates() {
        const response = await this.client.get('/templates/')
        return response.data
    }

    async getTemplate(id: string) {
        const response = await this.client.get(`/templates/${id}`)
        return response.data
    }

    // Sheets
    async validateSheet(sheetUrl: string) {
        const response = await this.client.get('/sheets/validate', { params: { sheet_url: sheetUrl } })
        return response.data
    }

    async previewSheet(sheetUrl: string, sheetName?: string) {
        const response = await this.client.get('/sheets/preview', {
            params: { sheet_url: sheetUrl, sheet_name: sheetName }
        })
        return response.data
    }
}

export const api = new APIClient()
