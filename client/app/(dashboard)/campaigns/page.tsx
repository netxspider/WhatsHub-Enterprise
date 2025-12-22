'use client'

import { useState, useEffect } from 'react'
import AnimatedList, { AnimatedItem } from '@/components/AnimatedList'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, TrendingUp, Calendar, BarChart3, MoreVertical, FileSpreadsheet, Users as UsersIcon } from 'lucide-react'
import { api } from '@/lib/api'
import { CampaignWizard } from '@/components/campaigns/CampaignWizard'

interface Campaign {
    id: string
    name: string
    status: 'draft' | 'active' | 'completed' | 'paused'
    total_contacts: number
    delivered_count: number
    read_count: number
    created_at: string
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [loading, setLoading] = useState(true)
    const [wizardOpen, setWizardOpen] = useState(false)

    useEffect(() => {
        fetchCampaigns()
    }, [])

    const fetchCampaigns = async () => {
        try {
            const data = await api.getCampaigns()
            setCampaigns(data)
        } catch (error: any) {
            console.error('Failed to fetch campaigns:', error)
            // If auth error, it will auto-redirect via interceptor
            // For other errors, show empty state
            if (error?.response?.status !== 401) {
                setCampaigns([])
            }
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = () => {
        const total = campaigns.length
        const thisMonth = campaigns.filter(c => {
            const createdDate = new Date(c.created_at)
            const now = new Date()
            return createdDate.getMonth() === now.getMonth() &&
                createdDate.getFullYear() === now.getFullYear()
        }).length

        const totalDelivered = campaigns.reduce((sum, c) => sum + c.delivered_count, 0)
        const totalContacts = campaigns.reduce((sum, c) => sum + c.total_contacts, 0)
        const avgReadRate = totalContacts > 0
            ? Math.round((campaigns.reduce((sum, c) => sum + c.read_count, 0) / totalContacts) * 100)
            : 0

        return { total, thisMonth, avgReadRate }
    }

    const stats = calculateStats()

    const getCampaignProgress = (campaign: Campaign) => {
        if (campaign.total_contacts === 0) return 0
        return Math.round((campaign.delivered_count / campaign.total_contacts) * 100)
    }

    const getReadRate = (campaign: Campaign) => {
        if (campaign.delivered_count === 0) return 0
        return Math.round((campaign.read_count / campaign.delivered_count) * 100)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-yellow-100 text-yellow-800">🟡 Processing</Badge>
            case 'completed':
                return <Badge className="bg-green-100 text-green-800">🟢 Completed</Badge>
            case 'draft':
                return <Badge variant="secondary">⚪ Draft</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return (
        <div className="p-3 md:p-6 space-y-4 md:space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Marketing Campaigns</h1>
                        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">Create and manage your WhatsApp campaigns</p>
                    </div>

                    {/* Mobile: + Icon Button */}
                    <div className="md:hidden">
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700"
                            onClick={() => setWizardOpen(true)}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Desktop: Full Button */}
                <Button
                    className="hidden md:flex bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={() => setWizardOpen(true)}
                >
                    <Plus className="mr-2 h-5 w-5" />
                    New Campaign
                </Button>
            </div>

            {/* Quick Stats - 2 columns on mobile, 3 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">All Campaigns</CardTitle>
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.total}</div>
                        <p className="text-xs text-gray-500 mt-1">Total campaigns created</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</CardTitle>
                        <Calendar className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.thisMonth}</div>
                        <p className="text-xs text-gray-500 mt-1">Campaigns started this month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Read Rate</CardTitle>
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.avgReadRate}%</div>
                        <p className="text-xs text-gray-500 mt-1">Average across all campaigns</p>
                    </CardContent>
                </Card>
            </div>

            {/* Campaign Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        Loading campaigns...
                    </div>
                ) : campaigns.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <FileSpreadsheet className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No campaigns yet</h3>
                        <p className="text-gray-500 mt-2">Create your first campaign to get started</p>
                        <Button
                            className="mt-4 bg-green-600 hover:bg-green-700"
                            onClick={() => setWizardOpen(true)}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Campaign
                        </Button>
                    </div>
                ) : (
                    campaigns.map((campaign, index) => {
                        const progress = getCampaignProgress(campaign)
                        const readRate = getReadRate(campaign)

                        return (
                            <AnimatedItem key={campaign.id} index={index} delay={0.05}>
                                <Card className="hover:shadow-lg transition-shadow h-full">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{campaign.name}</CardTitle>
                                                <p className="text-sm text-gray-500 mt-1">{formatDate(campaign.created_at)}</p>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {getStatusBadge(campaign.status)}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Progress Bar */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium">Progress</span>
                                                <span className="text-sm text-gray-600">{campaign.delivered_count} / {campaign.total_contacts} Sent</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                                <div
                                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{progress}% Complete</p>
                                        </div>

                                        {/* Metrics */}
                                        <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-green-600">{progress}%</div>
                                                <div className="text-xs text-gray-500">Delivered</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-blue-600">{readRate}%</div>
                                                <div className="text-xs text-gray-500">Read</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-purple-600">0%</div>
                                                <div className="text-xs text-gray-500">Replied</div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <Button variant="outline" size="sm" className="flex-1">
                                                View Report
                                            </Button>
                                            <Button variant="outline" size="sm" className="flex-1">
                                                Duplicate
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </AnimatedItem>
                        )
                    })
                )}
            </div>

            {/* Campaign Wizard Modal */}
            {
                wizardOpen && (
                    <CampaignWizard
                        isOpen={wizardOpen}
                        onClose={() => setWizardOpen(false)}
                        onSuccess={fetchCampaigns}
                    />
                )
            }
        </div>
    )
}
