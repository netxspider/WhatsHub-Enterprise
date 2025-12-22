'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
    ArrowLeft,
    Camera,
    Edit2,
    Phone,
    MapPin,
    Mail,
    Globe,
    Plus,
    Clock,
    FileText,
    Building,
    ChevronRight,
    Info
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [isEditing, setIsEditing] = useState<{ [key: string]: boolean }>({})
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        email: '',
        businessName: '',
        businessAddress: '',
        website: '',
        businessHours: '',
        businessDescription: '',
        about: 'Available',
    })

    useEffect(() => {
        loadUserProfile()
    }, [])

    const loadUserProfile = () => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}')
        setUser(userData)
        setProfileData({
            name: userData.name || '',
            phone: userData.phone || '',
            email: userData.email || '',
            businessName: '',
            businessAddress: '',
            website: '',
            businessHours: '',
            businessDescription: '',
            about: 'Available',
        })
    }

    const handleEdit = (field: string) => {
        setIsEditing({ ...isEditing, [field]: !isEditing[field] })
    }

    const handleSave = (field: string) => {
        setIsEditing({ ...isEditing, [field]: false })
        // Save to localStorage or API
        localStorage.setItem('userProfile', JSON.stringify(profileData))
    }

    const handleChange = (field: string, value: string) => {
        setProfileData({ ...profileData, [field]: value })
    }

    const getInitials = (name: string) => {
        if (!name) return 'U'
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex">
            {/* Left Panel - Profile Info */}
            <div className="w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-y-auto">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-semibold">Profile</h1>
                </div>

                {/* Profile Photo */}
                <div className="p-8 flex flex-col items-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                    <div className="relative group">
                        <div className="h-32 w-32 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold text-4xl">
                            {getInitials(profileData.name || user?.name || 'U')}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-700 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                            <Camera className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>

                {/* Profile Fields */}
                <div className="flex-1">
                    {/* Name */}
                    <div className="px-4 py-4 border-b border-gray-200">
                        <div className="flex items-start gap-3">
                            <div className="pt-1">
                                <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Name</label>
                                {isEditing.name ? (
                                    <div className="space-y-2">
                                        <Input
                                            value={profileData.name}
                                            onChange={(e) => handleChange('name', e.target.value)}
                                            className="border-green-500"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSave('name')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit('name')}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-900 dark:text-gray-100">{profileData.name || 'Add your name'}</p>
                                        <button
                                            onClick={() => handleEdit('name')}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                        >
                                            <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="px-4 py-4 border-b border-gray-200">
                        <div className="flex items-start gap-3">
                            <div className="pt-1">
                                <Phone className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Phone</label>
                                {isEditing.phone ? (
                                    <div className="space-y-2">
                                        <Input
                                            value={profileData.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className="border-green-500"
                                            autoFocus
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSave('phone')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit('phone')}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-gray-900 dark:text-gray-100">{profileData.phone || 'Add phone number'}</p>
                                            <button
                                                onClick={() => handleEdit('phone')}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Edit2 className="h-4 w-4 text-gray-500" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Name and phone number will be visible to your WhatsApp customers and can be edited from the app on your mobile device.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Business Name */}
                    <div className="px-4 py-4 border-b border-gray-200">
                        <div className="flex items-start gap-3">
                            <div className="pt-1">
                                <Building className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Business name</label>
                                {isEditing.businessName ? (
                                    <div className="space-y-2">
                                        <Input
                                            value={profileData.businessName}
                                            onChange={(e) => handleChange('businessName', e.target.value)}
                                            className="border-green-500"
                                            autoFocus
                                            placeholder="Enter business name"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSave('businessName')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit('businessName')}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-900">{profileData.businessName || 'Add business name'}</p>
                                        <button
                                            onClick={() => handleEdit('businessName')}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                        >
                                            <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Business Address */}
                    <div className="px-4 py-4 border-b border-gray-200">
                        <div className="flex items-start gap-3">
                            <div className="pt-1">
                                <MapPin className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Business address</label>
                                {isEditing.businessAddress ? (
                                    <div className="space-y-2">
                                        <Input
                                            value={profileData.businessAddress}
                                            onChange={(e) => handleChange('businessAddress', e.target.value)}
                                            className="border-green-500"
                                            autoFocus
                                            placeholder="Enter business address"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSave('businessAddress')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit('businessAddress')}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-900">{profileData.businessAddress || 'Add address'}</p>
                                        <button
                                            onClick={() => handleEdit('businessAddress')}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                        >
                                            <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="px-4 py-4 border-b border-gray-200">
                        <div className="flex items-start gap-3">
                            <div className="pt-1">
                                <Mail className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Email</label>
                                {isEditing.email ? (
                                    <div className="space-y-2">
                                        <Input
                                            value={profileData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="border-green-500"
                                            autoFocus
                                            type="email"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSave('email')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit('email')}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-900">{profileData.email || 'Add email'}</p>
                                        <button
                                            onClick={() => handleEdit('email')}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                        >
                                            <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Website */}
                    <div className="px-4 py-4 border-b border-gray-200">
                        <div className="flex items-start gap-3">
                            <div className="pt-1">
                                <Globe className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Website</label>
                                {isEditing.website ? (
                                    <div className="space-y-2">
                                        <Input
                                            value={profileData.website}
                                            onChange={(e) => handleChange('website', e.target.value)}
                                            className="border-green-500"
                                            autoFocus
                                            placeholder="https://"
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSave('website')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit('website')}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-gray-900">{profileData.website || 'Add website'}</p>
                                            <button
                                                onClick={() => handleEdit('website')}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                <Edit2 className="h-4 w-4 text-gray-500" />
                                            </button>
                                        </div>
                                        <button className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1">
                                            <Globe className="h-4 w-4" />
                                            ADD ANOTHER WEBSITE
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Separator - Business Information */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Business Information</h3>
                    </div>

                    {/* Business Hours */}
                    <div className="px-4 py-4 border-b border-gray-200">
                        <div className="flex items-start gap-3">
                            <div className="pt-1">
                                <Clock className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Business hours</label>
                                {isEditing.businessHours ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={profileData.businessHours}
                                            onChange={(e) => handleChange('businessHours', e.target.value)}
                                            placeholder="e.g., Mon-Fri: 9AM-6PM"
                                            className="border-green-500"
                                            rows={3}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSave('businessHours')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit('businessHours')}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-900">{profileData.businessHours || 'Add business hours'}</p>
                                        <button
                                            onClick={() => handleEdit('businessHours')}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                        >
                                            <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Business Description */}
                    <div className="px-4 py-4 border-b border-gray-200">
                        <div className="flex items-start gap-3">
                            <div className="pt-1">
                                <FileText className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">Business description</label>
                                {isEditing.businessDescription ? (
                                    <div className="space-y-2">
                                        <Textarea
                                            value={profileData.businessDescription}
                                            onChange={(e) => handleChange('businessDescription', e.target.value)}
                                            placeholder="Describe your business..."
                                            className="border-green-500"
                                            rows={4}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleSave('businessDescription')}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEdit('businessDescription')}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-900">{profileData.businessDescription || 'Add description'}</p>
                                        <button
                                            onClick={() => handleEdit('businessDescription')}
                                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                                        >
                                            <Edit2 className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Business Details */}
                    <div className="px-4 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Building className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="font-medium text-gray-900">Business details</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>

                    {/* Products */}
                    <div className="px-4 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                            <p className="font-medium text-gray-700">Products</p>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                        <div className="flex flex-col items-center gap-3 py-4">
                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-green-500 transition-colors">
                                <Plus className="h-8 w-8 text-gray-400" />
                            </div>
                            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                                Add catalogue
                            </button>
                        </div>
                    </div>

                    {/* About */}
                    <div className="px-4 py-4">
                        <div className="flex items-start gap-3">
                            <div className="pt-1">
                                <Info className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-gray-500 mb-1 block">About</label>
                                <p className="text-gray-900">{profileData.about}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Empty State */}
            <div className="flex-1 overflow-y-auto flex items-center justify-center bg-gray-50/50 dark:bg-[#181818]/50">
                <div className="text-center max-w-md p-8">
                    <div className="h-32 w-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Profile Information
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        Update your business profile from the left panel
                    </p>
                </div>
            </div>
        </div>
    )
}
