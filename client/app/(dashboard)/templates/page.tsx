'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Save, Smartphone, X, ArrowLeft } from 'lucide-react'
import { api } from '@/lib/api'

interface TemplateParameter {
    name: string
    example: string
}

interface Template {
    id: string
    name: string
    category: string
    content: string
    parameters: TemplateParameter[]
    status: string
}

export default function TemplatesPage() {
    const [templates, setTemplates] = useState<Template[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [loading, setLoading] = useState(true)

    // Form fields
    const [templateName, setTemplateName] = useState('')
    const [category, setCategory] = useState('marketing')
    const [messageContent, setMessageContent] = useState('')
    const [parameters, setParameters] = useState<TemplateParameter[]>([])

    useEffect(() => {
        fetchTemplates()
    }, [])

    const fetchTemplates = async () => {
        try {
            const data = await api.get('/templates/')
            setTemplates(data.data)
        } catch (error) {
            console.error('Failed to fetch templates:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateNew = () => {
        setIsCreating(true)
        setSelectedTemplate(null)
        setTemplateName('')
        setCategory('marketing')
        setMessageContent('')
        setParameters([])
    }

    const handleSelectTemplate = (template: Template) => {
        setSelectedTemplate(template)
        setIsCreating(false)
        setTemplateName(template.name)
        setCategory(template.category)
        setMessageContent(template.content)
        setParameters(template.parameters)
    }

    const handleAddParameter = () => {
        const newIndex = parameters.length + 1
        setParameters([...parameters, { name: `parameter_${newIndex}`, example: 'Example' }])

        // Insert parameter placeholder in message at cursor position
        const paramPlaceholder = `{{${newIndex}}}`
        setMessageContent(prev => prev + paramPlaceholder)
    }

    const handleUpdateParameter = (index: number, field: 'name' | 'example', value: string) => {
        const updated = [...parameters]
        updated[index][field] = value
        setParameters(updated)
    }

    const handleRemoveParameter = (index: number) => {
        setParameters(parameters.filter((_, i) => i !== index))
    }

    const handleSaveTemplate = async () => {
        if (!templateName.trim() || !messageContent.trim()) {
            alert('Please enter template name and message')
            return
        }

        try {
            await api.post('/templates/', {
                name: templateName.trim(),
                category,
                content: messageContent.trim(),
                parameters
            })

            alert('Template saved successfully!')
            await fetchTemplates()
            setIsCreating(false)
            setTemplateName('')
            setMessageContent('')
            setParameters([])
        } catch (error: any) {
            alert(error?.response?.data?.detail || 'Failed to save template')
        }
    }

    const getRenderPreview = () => {
        let preview = messageContent
        parameters.forEach((param, index) => {
            const placeholder = `{{${index + 1}}}`
            preview = preview.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), param.example)
        })
        return preview
    }

    return (
        <div className="h-screen flex">
            {/* Left Sidebar - Templates List - Hidden on mobile when editing */}
            <div className={`w-full md:w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#181818] backdrop-blur-sm flex flex-col ${selectedTemplate ? 'hidden md:flex' : 'flex'
                }`}>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">Templates</h1>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCreateNew}
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="p-4 text-center text-gray-500">Loading templates...</div>
                    )}

                    {!loading && templates.length === 0 && (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            <p className="mb-2">No templates yet</p>
                            <p className="text-sm">Create your first template</p>
                        </div>
                    )}

                    {templates.map((template) => {
                        return (
                            <div
                                key={template.id}
                                onClick={() => handleSelectTemplate(template)}
                                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${selectedTemplate?.id === template.id
                                    ? 'bg-gray-100 dark:bg-gray-700'
                                    : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-semibold">{template.name}</h3>
                                    <Badge variant={template.status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                                        {template.status}
                                    </Badge>
                                </div>
                                <p className="text-xs text-gray-500 capitalize">{template.category}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                    {template.content}
                                </p>
                            </div>
                        )
                    })}
                </div>

                <button
                    onClick={handleCreateNew}
                    className="p-4 border-t border-gray-200 dark:border-gray-700 text-green-600 hover:bg-gray-50 dark:hover:bg-gray-750 flex items-center gap-2 font-medium"
                >
                    <Plus className="h-4 w-4" />
                    Create template
                </button>
            </div>

            {/* Main Editor Panel */}
            {(isCreating || selectedTemplate) ? (
                <div className="flex-1 flex">
                    {/* Editor */}
                    <div className="flex-1 p-6 overflow-y-auto bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
                        <div className="max-w-3xl">
                            {/* Back button for mobile */}
                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden mb-4"
                                onClick={() => {
                                    setSelectedTemplate(null);
                                    setIsCreating(false);
                                }}
                            >
                                <ArrowLeft className="h-5 w-5 mr-2" /> Back
                            </Button>

                            <h2 className="text-2xl font-bold mb-6">{isCreating ? 'Create New Template' : 'Template Details'}</h2>

                            {/* Template Name */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Template Name</label>
                                <Input
                                    placeholder="e.g., Welcome Message"
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    disabled={!isCreating && selectedTemplate?.status === 'approved'}
                                />
                            </div>

                            {/* Category */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    disabled={!isCreating && selectedTemplate?.status === 'approved'}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                >
                                    <option value="marketing">Marketing</option>
                                    <option value="utility">Utility</option>
                                    <option value="authentication">Authentication</option>
                                    <option value="transactional">Transactional</option>
                                </select>
                            </div>

                            {/* Message Content */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium">Message Content</label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddParameter}
                                        disabled={!isCreating}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Parameter
                                    </Button>
                                </div>
                                <textarea
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    placeholder="Enter your message. Use {{1}}, {{2}}, etc. for parameters."
                                    disabled={!isCreating && selectedTemplate?.status === 'approved'}
                                    className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 resize-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Use {'{{1}}'}, {'{{2}}'}, etc. for parameters
                                </p>
                            </div>

                            {/* Parameters */}
                            {parameters.length > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">Parameters</label>
                                    <div className="space-y-3">
                                        {parameters.map((param, index) => (
                                            <Card key={index} className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-shrink-0 w-16 text-center">
                                                        <Badge variant="outline">{`{{${index + 1}}}`}</Badge>
                                                    </div>
                                                    <div className="flex-1 grid grid-cols-2 gap-3">
                                                        <Input
                                                            placeholder="Parameter name"
                                                            value={param.name}
                                                            onChange={(e) => handleUpdateParameter(index, 'name', e.target.value)}
                                                            disabled={!isCreating}
                                                        />
                                                        <Input
                                                            placeholder="Example value"
                                                            value={param.example}
                                                            onChange={(e) => handleUpdateParameter(index, 'example', e.target.value)}
                                                            disabled={!isCreating}
                                                        />
                                                    </div>
                                                    {isCreating && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveParameter(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Save Button */}
                            {isCreating && (
                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleSaveTemplate}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Template
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreating(false)
                                            setSelectedTemplate(null)
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Preview */}
                    <div className="w-96 bg-gray-100 dark:bg-gray-800 p-6 border-l border-gray-200 dark:border-gray-700">
                        <div className="sticky top-6">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Smartphone className="h-5 w-5" />
                                Preview
                            </h3>

                            {/* Phone Mockup */}
                            <div className="mx-auto" style={{ width: '280px' }}>
                                {/* Phone Frame */}
                                <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl">
                                    {/* Notch */}
                                    <div className="bg-black rounded-[2rem] overflow-hidden">
                                        <div className="h-6 bg-black flex items-center justify-center">
                                            <div className="w-24 h-4 bg-gray-900 rounded-full"></div>
                                        </div>

                                        {/* Screen */}
                                        <div className="bg-[#efeae2] h-[480px] overflow-y-auto p-4">
                                            {/* WhatsApp Style Message Bubble */}
                                            <div className="mb-4">
                                                <div className="bg-white rounded-lg rounded-tl-none shadow-sm p-3 max-w-[85%]">
                                                    <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                                                        {getRenderPreview() || 'Your message will appear here...'}
                                                    </p>
                                                    <div className="text-xs text-gray-500 text-right mt-1">
                                                        12:00 PM
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Parameter Values Display */}
                            {parameters.length > 0 && (
                                <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg">
                                    <h4 className="text-sm font-semibold mb-2">Example Values</h4>
                                    <div className="space-y-1">
                                        {parameters.map((param, index) => (
                                            <div key={index} className="text-xs flex justify-between">
                                                <span className="text-gray-600 dark:text-gray-400">{`{{${index + 1}}}`}</span>
                                                <span className="font-medium">{param.example}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="hidden md:flex flex-1 items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="h-32 w-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                            <Plus className="h-16 w-16 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Create or Select a Template
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Choose a template from the list or create a new one to get started
                        </p>
                        <Button
                            onClick={handleCreateNew}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create New Template
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
