'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Send, Users, Eye, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Campaign } from '@/types'

export default function CampaignsPage() {
    const queryClient = useQueryClient()
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)

    const { data: campaigns, isLoading } = useQuery({
        queryKey: ['campaigns'],
        queryFn: () => api.getCampaigns(),
    })

    const { data: templates } = useQuery({
        queryKey: ['templates'],
        queryFn: () => api.getTemplates(),
    })

    const createCampaignMutation = useMutation({
        mutationFn: (data: any) => api.createCampaign(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] })
            setIsCreateOpen(false)
            toast.success('Campaign created successfully! Messages are being sent.')
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.detail || 'Failed to create campaign')
        },
    })

    const handleCreateCampaign = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)

        const data: any = {
            name: formData.get('name'),
            sheet_url: formData.get('sheet_url'),
            sheet_name: formData.get('sheet_name') || undefined,
        }

        const templateId = formData.get('template_id')
        if (templateId && templateId !== 'none') {
            data.template_id = templateId

            // Get template parameters
            const template = templates?.find((t: { _id: string }) => t._id === templateId)
            if (template) {
                const parameters: Record<string, string> = {}
                template.parameters.forEach((param: { name: string }, index: number) => {
                    const value = formData.get(`param_${index}`)
                    if (value) {
                        parameters[param.name] = value as string
                    }
                })
                data.template_parameters = parameters
            }
        }

        createCampaignMutation.mutate(data)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-blue-500'
            case 'completed':
                return 'bg-green-500'
            case 'paused':
                return 'bg-yellow-500'
            default:
                return 'bg-gray-500'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
                    <p className="text-gray-500">Manage your WhatsApp marketing campaigns</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4 mr-2" />
                            New Campaign
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Campaign</DialogTitle>
                            <DialogDescription>
                                Import contacts from Google Sheets and send bulk messages
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateCampaign} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Campaign Name</Label>
                                <Input id="name" name="name" placeholder="Diwali Sale 2024" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sheet_url">Google Sheet URL</Label>
                                <Input
                                    id="sheet_url"
                                    name="sheet_url"
                                    placeholder="https://docs.google.com/spreadsheets/d/..."
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    Make sure the sheet is shared with your service account or is public
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sheet_name">Sheet Name (Optional)</Label>
                                <Input
                                    id="sheet_name"
                                    name="sheet_name"
                                    placeholder="Sheet1"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="template_id">Template (Optional)</Label>
                                <Select name="template_id" defaultValue="none">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a template" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">No template</SelectItem>
                                        {templates?.map((template: { _id: string; name: string }) => (
                                            <SelectItem key={template._id} value={template._id}>
                                                {template.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={createCampaignMutation.isPending}>
                                    {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Loading campaigns...
                    </div>
                ) : campaigns && campaigns.length > 0 ? (
                    campaigns.map((campaign: Campaign) => (
                        <Card key={campaign._id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                        <CardDescription className="mt-1">
                                            {new Date(campaign.created_at).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <Badge className={getStatusColor(campaign.status)}>
                                        {campaign.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="flex items-center justify-center mb-1">
                                            <Users className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="text-2xl font-bold">{campaign.total_contacts}</div>
                                        <div className="text-xs text-gray-500">Contacts</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-center mb-1">
                                            <Send className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="text-2xl font-bold">{campaign.delivered_count}</div>
                                        <div className="text-xs text-gray-500">Delivered</div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-center mb-1">
                                            <Eye className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div className="text-2xl font-bold">{campaign.read_count}</div>
                                        <div className="text-xs text-gray-500">Read</div>
                                    </div>
                                </div>

                                {campaign.total_contacts > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Delivery Progress</span>
                                            <span>{Math.round((campaign.delivered_count / campaign.total_contacts) * 100)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all"
                                                style={{ width: `${(campaign.delivered_count / campaign.total_contacts) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No campaigns yet</h3>
                        <p className="text-gray-500 mb-4">Create your first campaign to start sending messages</p>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Campaign
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
