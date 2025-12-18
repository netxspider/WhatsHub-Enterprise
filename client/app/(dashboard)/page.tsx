'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MessageSquare, Send, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Campaign } from '@/types'


export default function DashboardPage() {
    const { data: contacts } = useQuery({
        queryKey: ['contacts'],
        queryFn: () => api.getContacts(),
    })

    const { data: threads } = useQuery({
        queryKey: ['threads'],
        queryFn: () => api.getChatThreads(),
    })

    const { data: campaigns } = useQuery({
        queryKey: ['campaigns'],
        queryFn: () => api.getCampaigns(),
    })

    // Mock chart data
    const messageData = [
        { name: 'Mon', sent: 45, delivered: 42, read: 38 },
        { name: 'Tue', sent: 52, delivered: 50, read: 45 },
        { name: 'Wed', sent: 61, delivered: 58, read: 52 },
        { name: 'Thu', sent: 58, delivered: 55, read: 50 },
        { name: 'Fri', sent: 70, delivered: 68, read: 62 },
        { name: 'Sat', sent: 48, delivered: 46, read: 41 },
        { name: 'Sun', sent: 35, delivered: 33, read: 30 },
    ]

    const stats = [
        {
            name: 'Total Contacts',
            value: contacts?.length || 0,
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            name: 'Active Chats',
            value: threads?.length || 0,
            icon: MessageSquare,
            color: 'bg-green-500',
        },
        {
            name: 'Campaigns',
            value: campaigns?.length || 0,
            icon: Send,
            color: 'bg-purple-500',
        },
        {
            name: 'Total Messages',
            value: campaigns?.reduce((sum: number, c: Campaign) => sum + c.total_contacts, 0) || 0,
            icon: TrendingUp,
            color: 'bg-orange-500',
        },
    ]

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500">Welcome to your WhatsApp marketing dashboard</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.name}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">
                                {stat.name}
                            </CardTitle>
                            <div className={`${stat.color} p-2 rounded-lg`}>
                                <stat.icon className="w-4 h-4 text-white" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Message Analytics</CardTitle>
                        <CardDescription>Sent vs Delivered vs Read</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={messageData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="sent" fill="#3b82f6" />
                                <Bar dataKey="delivered" fill="#10b981" />
                                <Bar dataKey="read" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Weekly Trends</CardTitle>
                        <CardDescription>Message delivery trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={messageData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="sent" stroke="#3b82f6" strokeWidth={2} />
                                <Line type="monotone" dataKey="delivered" stroke="#10b981" strokeWidth={2} />
                                <Line type="monotone" dataKey="read" stroke="#8b5cf6" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Campaigns */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Campaigns</CardTitle>
                    <CardDescription>Latest marketing campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                    {campaigns && campaigns.length > 0 ? (
                        <div className="space-y-4">
                            {campaigns.slice(0, 5).map((campaign: Campaign) => (
                                <div key={campaign._id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <h4 className="font-semibold">{campaign.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            {campaign.total_contacts} contacts • {campaign.delivered_count} delivered • {campaign.read_count} read
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium text-green-600">{campaign.status}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No campaigns yet. Create your first campaign to get started!</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
