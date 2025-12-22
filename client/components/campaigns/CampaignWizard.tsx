'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    X,
    Users,
    FileSpreadsheet,
    MessageSquare,
    Rocket,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    Loader2
} from 'lucide-react'
import { api } from '@/lib/api'
import confetti from 'canvas-confetti'

interface CampaignWizardProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

const DEMO_TEMPLATES = [
    { id: '1', name: 'Welcome Message', content: 'Hi {{1}}! Welcome to our service. We\'re excited to have you!' },
    { id: '2', name: 'Season Offer', content: 'Hello {{1}}! Don\'t miss our special seasonal offer - {{2}} off!' },
    { id: '3', name: 'Payment Reminder', content: 'Hi {{1}}, this is a friendly reminder about your pending payment of {{2}}.' },
    { id: '4', name: 'Order Confirmation', content: 'Dear {{1}}, your order #{{2}} has been confirmed and will be delivered soon!' },
    { id: '5', name: 'Feedback Request', content: 'Hi {{1}}! We\'d love to hear your feedback about {{2}}. Reply with your thoughts!' },
]

export function CampaignWizard({ isOpen, onClose, onSuccess }: CampaignWizardProps) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [validating, setValidating] = useState(false)
    const [sheetValid, setSheetValid] = useState(false)
    const [contactCount, setContactCount] = useState(0)

    // Form state
    const [campaignName, setCampaignName] = useState('')
    const [sourceType, setSourceType] = useState<'contacts' | 'sheet'>('sheet')
    const [sheetUrl, setSheetUrl] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState(DEMO_TEMPLATES[0])
    const [templateParams, setTemplateParams] = useState<Record<string, string>>({})

    if (!isOpen) return null

    const validateSheet = async () => {
        if (!sheetUrl) return

        setValidating(true)
        try {
            // Simulate validation - in real app, call API to check sheet
            await new Promise(resolve => setTimeout(resolve, 1500))
            setSheetValid(true)
            setContactCount(Math.floor(Math.random() * 50) + 20) // Random 20-70
        } catch (error) {
            console.error('Failed to validate sheet:', error)
        } finally {
            setValidating(false)
        }
    }

    const handleNext = async () => {
        if (step === 1) {
            if (!campaignName) {
                alert('Please enter a campaign name')
                return
            }
            if (sourceType === 'sheet' && !sheetValid) {
                alert('Please validate your Google Sheet URL first')
                return
            }
        }
        setStep(step + 1)
    }

    const handleLaunch = async () => {
        setLoading(true)
        try {
            const campaign = await api.createCampaign({
                name: campaignName,
                sheet_url: sheetUrl,
                template_id: selectedTemplate.id,
                template_parameters: templateParams
            })

            // Success! Trigger confetti
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            })

            onSuccess()
            onClose()
            resetForm()
        } catch (error: any) {
            console.error('Failed to create campaign:', error)
            const errorMessage = error?.response?.data?.detail || 'Failed to create campaign. Please try again.'
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setStep(1)
        setCampaignName('')
        setSourceType('sheet')
        setSheetUrl('')
        setSheetValid(false)
        setContactCount(0)
        setSelectedTemplate(DEMO_TEMPLATES[0])
        setTemplateParams({})
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-6 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Campaign</h2>
                        <p className="text-sm text-gray-500 mt-1">Step {step} of 3</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-4">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex-1">
                                <div className={`h-2 rounded-full ${s <= step ? 'bg-green-600' : 'bg-gray-200'} transition-all`} />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                        <span>Audience</span>
                        <span>Message</span>
                        <span>Launch</span>
                    </div>
                </div>

                {/* Step Content */}
                <div className="p-6">
                    {/* Step 1: Audience */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Campaign Name</label>
                                <Input
                                    placeholder="e.g., Diwali Sale Blast"
                                    value={campaignName}
                                    onChange={(e) => setCampaignName(e.target.value)}
                                    className="text-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3">Select Audience Source</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* From Contacts */}
                                    <Card
                                        className={`p-6 cursor-pointer border-2 transition-all ${sourceType === 'contacts'
                                            ? 'border-green-600 bg-green-50 dark:bg-green-950'
                                            : 'border-gray-200'
                                            }`}
                                        onClick={() => setSourceType('contacts')}
                                    >
                                        <Users className="h-8 w-8 text-green-600 mb-3" />
                                        <h3 className="font-semibold mb-1">Select from Contacts</h3>
                                        <p className="text-sm text-gray-600">Filter by tags and select contacts</p>
                                    </Card>

                                    {/* From Sheet */}
                                    <Card
                                        className={`p-6 cursor-pointer border-2 transition-all ${sourceType === 'sheet'
                                            ? 'border-green-600 bg-green-50 dark:bg-green-950'
                                            : 'border-gray-200'
                                            }`}
                                        onClick={() => setSourceType('sheet')}
                                    >
                                        <FileSpreadsheet className="h-8 w-8 text-green-600 mb-3" />
                                        <h3 className="font-semibold mb-1">Import from Google Sheet</h3>
                                        <p className="text-sm text-gray-600">Paste your sheet URL</p>
                                    </Card>
                                </div>
                            </div>

                            {sourceType === 'sheet' && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium">Google Sheet URL</label>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="https://docs.google.com/spreadsheets/d/..."
                                            value={sheetUrl}
                                            onChange={(e) => {
                                                setSheetUrl(e.target.value)
                                                setSheetValid(false)
                                            }}
                                        />
                                        <Button
                                            onClick={validateSheet}
                                            disabled={!sheetUrl || validating}
                                            variant="outline"
                                        >
                                            {validating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Checking...
                                                </>
                                            ) : (
                                                'Validate'
                                            )}
                                        </Button>
                                    </div>
                                    {sheetValid && (
                                        <div className="flex items-center gap-2 text-green-600 text-sm">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span>Found {contactCount} contacts</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {sourceType === 'contacts' && (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                        Contact filtering will be available in the next version. For now, please use Google Sheets import.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Message Template */}
                    {step === 2 && (
                        <div className="grid grid-cols-2 gap-6">
                            {/* Template Selector */}
                            <div className="space-y-4">
                                <label className="block text-sm font-medium">Select Template</label>
                                {DEMO_TEMPLATES.map((template) => (
                                    <Card
                                        key={template.id}
                                        className={`p-4 cursor-pointer border-2 transition-all ${selectedTemplate.id === template.id
                                            ? 'border-green-600 bg-green-50 dark:bg-green-950'
                                            : 'border-gray-200'
                                            }`}
                                        onClick={() => setSelectedTemplate(template)}
                                    >
                                        <h3 className="font-semibold mb-1">{template.name}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-2">{template.content}</p>
                                    </Card>
                                ))}
                            </div>

                            {/* Mobile Preview */}
                            <div>
                                <label className="block text-sm font-medium mb-3">Preview</label>
                                <div className="mx-auto max-w-sm">
                                    {/* Phone Frame */}
                                    <div className="relative border-8 border-gray-800 rounded-[40px] h-[600px] bg-white shadow-2xl">
                                        {/* Notch */}
                                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-3xl"></div>

                                        {/* Screen Content */}
                                        <div className="h-full flex flex-col bg-gradient-to-b from-teal-50 to-teal-100 rounded-[32px] p-4 pt-8">
                                            {/* WhatsApp Header */}
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-10 w-10 rounded-full bg-gray-300"></div>
                                                <div>
                                                    <div className="font-semibold text-sm">Customer Name</div>
                                                    <div className="text-xs text-gray-600">online</div>
                                                </div>
                                            </div>

                                            {/* Message Bubble */}
                                            <div className="flex-1 flex items-end">
                                                <div className="bg-white rounded-lg p-3 shadow-sm max-w-[85%]">
                                                    <p className="text-sm whitespace-pre-wrap">
                                                        {selectedTemplate.content
                                                            .replace('{{1}}', 'Customer Name')
                                                            .replace('{{2}}', templateParams['param2'] || 'Value')}
                                                    </p>
                                                    <div className="text-xs text-gray-500 mt-1 text-right">12:34 PM</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Parameter Inputs */}
                                {selectedTemplate.content.includes('{{2}}') && (
                                    <div className="mt-4 space-y-2">
                                        <label className="block text-sm font-medium">Template Parameter</label>
                                        <Input
                                            placeholder="Enter value for {{2}}"
                                            value={templateParams['param2'] || ''}
                                            onChange={(e) => setTemplateParams({ ...templateParams, param2: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review & Launch */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg p-6">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <Rocket className="h-5 w-5 text-green-600" />
                                    Ready to Launch!
                                </h3>

                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Campaign Name:</span>
                                        <span className="font-semibold">{campaignName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Recipients:</span>
                                        <span className="font-semibold">{contactCount} contacts</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Template:</span>
                                        <span className="font-semibold">{selectedTemplate.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Source:</span>
                                        <Badge>Google Sheets</Badge>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3">Message Preview:</h4>
                                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 font-mono text-sm">
                                    {selectedTemplate.content
                                        .replace('{{1}}', '[Customer Name]')
                                        .replace('{{2}}', templateParams['param2'] || '[Value]')}
                                </div>
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>Note:</strong> Messages will be sent immediately after launch. You can monitor the progress in real-time from the campaigns dashboard.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t p-6 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={() => step === 1 ? onClose() : setStep(step - 1)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {step === 1 ? 'Cancel' : 'Back'}
                    </Button>

                    {step < 3 ? (
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleNext}
                            disabled={step === 1 && sourceType === 'sheet' && !sheetValid}
                        >
                            Next
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleLaunch}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Launching...
                                </>
                            ) : (
                                <>
                                    <Rocket className="mr-2 h-4 w-4" />
                                    Launch Campaign
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    )
}
