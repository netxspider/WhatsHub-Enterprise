'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Users,
    Send,
    Megaphone,
    TrendingUp,
    MessageSquare,
    UserPlus,
    Zap,
    CheckCircle2,
    AlertCircle,
    Clock
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

// Mock data for charts
const messageVolumeData = [
    { day: 'Mon', sent: 1200, read: 980 },
    { day: 'Tue', sent: 1800, read: 1450 },
    { day: 'Wed', sent: 2100, read: 1820 },
    { day: 'Thu', sent: 1950, read: 1650 },
    { day: 'Fri', sent: 2400, read: 2100 },
    { day: 'Sat', sent: 1600, read: 1380 },
    { day: 'Sun', sent: 1400, read: 1150 },
]

const campaignPerformanceData = [
    { name: 'Delivered', value: 70, color: '#22c55e' },
    { name: 'Read', value: 20, color: '#3b82f6' },
    { name: 'Failed', value: 10, color: '#ef4444' },
]

const initialActivities = [
    { id: 1, icon: MessageSquare, title: 'New Message from Alice', subtitle: '"Hey, about that offer..."', time: '2m ago', type: 'message' },
    { id: 2, icon: Megaphone, title: 'Campaign Started', subtitle: 'End of Season Sale', time: '15m ago', type: 'campaign' },
    { id: 3, icon: UserPlus, title: 'New Lead: Rahul Sharma', subtitle: 'via Google Sheets', time: '1h ago', type: 'lead' },
    { id: 4, icon: AlertCircle, title: 'System Alert', subtitle: 'Daily limit approaching', time: '5h ago', type: 'alert' },
]

export default function DashboardPage() {
    const [messagesSent, setMessagesSent] = useState(8502)
    const [totalContacts, setTotalContacts] = useState(1245)
    const [activities, setActivities] = useState(initialActivities)

    // Simulate live updates
    useEffect(() => {
        const interval = setInterval(() => {
            // Increment messages sent
            setMessagesSent(prev => prev + Math.floor(Math.random() * 3))

            // Occasionally add new contact
            if (Math.random() > 0.7) {
                setTotalContacts(prev => prev + 1)
            }
        }, 4000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="p-6 space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your campaigns.</p>
            </div>

            {/* KPI Cards - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Contacts */}
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Contacts</CardTitle>
                        <Users className="h-5 w-5 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalContacts.toLocaleString()}</div>
                        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            +45 new this week
                        </p>
                    </CardContent>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 dark:bg-green-950 rounded-full -mr-16 -mt-16 opacity-50"></div>
                </Card>

                {/* Messages Sent */}
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Messages Sent (24h)</CardTitle>
                        <Send className="h-5 w-5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">{messagesSent.toLocaleString()}</div>
                        <p className="text-xs text-blue-600 mt-2">98% Delivery Rate</p>
                    </CardContent>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-950 rounded-full -mr-16 -mt-16 opacity-50"></div>
                </Card>

                {/* Active Campaigns */}
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Campaigns</CardTitle>
                        <div className="relative">
                            <Megaphone className="h-5 w-5 text-purple-600" />
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-purple-600 rounded-full animate-ping"></span>
                            <span className="absolute -top-1 -right-1 h-2 w-2 bg-purple-600 rounded-full"></span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">3</div>
                        <p className="text-xs text-purple-600 mt-2">Currently running</p>
                    </CardContent>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-950 rounded-full -mr-16 -mt-16 opacity-50"></div>
                </Card>

                {/* Response Rate */}
                <Card className="relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Rate</CardTitle>
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900 dark:text-white">24%</div>
                        <p className="text-xs text-emerald-600 mt-2">Avg reply time: 2m</p>
                    </CardContent>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 dark:bg-emerald-950 rounded-full -mr-16 -mt-16 opacity-50"></div>
                </Card>
            </div>

            {/* Charts - Middle Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Message Volume Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Message Volume (Last 7 Days)</CardTitle>
                        <CardDescription>Track your messaging performance over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={messageVolumeData}>
                                <defs>
                                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorRead" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                <XAxis dataKey="day" className="text-xs" />
                                <YAxis className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="sent" stroke="#22c55e" fillOpacity={1} fill="url(#colorSent)" strokeWidth={2} />
                                <Area type="monotone" dataKey="read" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRead)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Campaign Performance Donut Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Campaign Stats</CardTitle>
                        <CardDescription>Diwali Sale Performance</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={campaignPerformanceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {campaignPerformanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    formatter={(value, entry: any) => `${value} (${entry.payload.value}%)`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Feed */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates from your campaigns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {activities.map((activity) => {
                                const Icon = activity.icon
                                return (
                                    <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div className={`
                      p-2 rounded-full
                      ${activity.type === 'message' ? 'bg-blue-100 dark:bg-blue-900' : ''}
                      ${activity.type === 'campaign' ? 'bg-green-100 dark:bg-green-900' : ''}
                      ${activity.type === 'lead' ? 'bg-purple-100 dark:bg-purple-900' : ''}
                      ${activity.type === 'alert' ? 'bg-orange-100 dark:bg-orange-900' : ''}
                    `}>
                                            <Icon className={`h-4 w-4
                        ${activity.type === 'message' ? 'text-blue-600' : ''}
                        ${activity.type === 'campaign' ? 'text-green-600' : ''}
                        ${activity.type === 'lead' ? 'text-purple-600' : ''}
                        ${activity.type === 'alert' ? 'text-orange-600' : ''}
                      `} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.subtitle}</p>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <Clock className="h-3 w-3" />
                                            {activity.time}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions & System Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Quick Action Buttons */}
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="lg">
                            <Megaphone className="mr-2 h-5 w-5" />
                            New Campaign
                        </Button>
                        <Button variant="outline" className="w-full" size="lg">
                            <UserPlus className="mr-2 h-5 w-5" />
                            Import Contacts
                        </Button>

                        {/* System Status */}
                        <div className="pt-4 border-t">
                            <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white">System Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">WhatsApp API</span>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Connected
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Sheet Sync</span>
                                    </div>
                                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Active
                                    </Badge>
                                </div>
                                <div className="pt-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Credits Used</span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">450 / 1000</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Zap className="h-3 w-3 text-yellow-500" />
                                        550 credits remaining
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
