'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface ImportSheetsDialogProps {
    open: boolean
    onOpen Change: (open: boolean) => void
    onSuccess: () => void
}

export function ImportSheetsDialog({ open, onOpenChange, onSuccess }: ImportSheetsDialogProps) {
    const [loading, setLoading] = useState(false)
    const [validating, setValidating] = useState(false)
    const [sheetUrl, setSheetUrl] = useState('')
    const [sheetValid, setSheetValid] = useState<boolean | null>(null)
    const [sheetNames, setSheetNames] = useState<string[]>([])
    const [selectedSheet, setSelectedSheet] = useState<string>('')
    const [previewData, setPreviewData] = useState<any[]>([])

    const validateSheet = async () => {
        if (!sheetUrl) return

        setValidating(true)
        try {
            const result = await api.validateSheet(sheetUrl)
            setSheetValid(result.valid)
            if (result.valid) {
                setSheetNames(result.sheet_names || [])
                if (result.sheet_names && result.sheet_names.length > 0) {
                    setSelectedSheet(result.sheet_names[0])
                }
                toast.success('Google Sheet validated successfully')
            } else {
                toast.error(result.message || 'Failed to validate sheet')
            }
        } catch (error: any) {
            setSheetValid(false)
            toast.error('Failed to validate sheet. Make sure it\'s shared with the service account.')
        } finally {
            setValidating(false)
        }
    }

    const previewSheetData = async () => {
        if (!sheetUrl || !selectedSheet) return

        setLoading(true)
        try {
            const result = await api.previewSheet(sheetUrl, selectedSheet)
            setPreviewData(result.data || [])
            toast.success(`Preview loaded: ${result.preview_rows} rows`)
        } catch (error: any) {
            toast.error('Failed to preview sheet data')
        } finally {
            setLoading(false)
        }
    }

    const handleImport = async () => {
        if (!sheetUrl) {
            toast.error('Please enter a Google Sheet URL')
            return
        }

        setLoading(true)
        try {
            // Create a campaign to import contacts
            const campaign = await api.createCampaign({
                name: `Import from ${new Date().toLocaleDateString()}`,
                sheet_url: sheetUrl,
                sheet_name: selectedSheet || undefined
            })

            toast.success('Contacts imported successfully!')
            onSuccess()
            onOpenChange(false)
            // Reset state
            setSheetUrl('')
            setSheetValid(null)
            setPreviewData([])
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to import contacts')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                        Import from Google Sheets
                    </DialogTitle>
                    <DialogDescription>
                        Import contacts from a Google Sheet. Make sure the sheet is shared with the service account.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="sheet-url">Google Sheet URL *</Label>
                        <div className="flex gap-2">
                            <Input
                                id="sheet-url"
                                value={sheetUrl}
                                onChange={(e) => {
                                    setSheetUrl(e.target.value)
                                    setSheetValid(null)
                                }}
                                placeholder="https://docs.google.com/spreadsheets/d/..."
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                onClick={validateSheet}
                                disabled={validating || !sheetUrl}
                                variant="outline"
                            >
                                {validating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Validating...
                                    </>
                                ) : (
                                    'Validate'
                                )}
                            </Button>
                        </div>
                        {sheetValid !== null && (
                            <div className={`flex items-center gap-2 text-sm ${sheetValid ? 'text-green-600' : 'text-red-600'}`}>
                                {sheetValid ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Sheet is valid and accessible
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="h-4 w-4" />
                                        Sheet not accessible. Check sharing settings.
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {sheetNames.length > 0 && (
                        <div className="grid gap-2">
                            <Label htmlFor="sheet-name">Select Sheet</Label>
                            <select
                                id="sheet-name"
                                value={selectedSheet}
                                onChange={(e) => setSelectedSheet(e.target.value)}
                                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800"
                            >
                                {sheetNames.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                ))}
                            </select>
                            <Button
                                type="button"
                                onClick={previewSheetData}
                                variant="outline"
                                size="sm"
                                disabled={loading}
                            >
                                Preview Data
                            </Button>
                        </div>
                    )}

                    {previewData.length > 0 && (
                        <div className="grid gap-2">
                            <Label>Preview (First 10 rows)</Label>
                            <div className="border rounded-lg p-4 max-h-60 overflow-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            {Object.keys(previewData[0]).map(key => (
                                                <th key={key} className="text-left p-2 font-semibold">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.slice(0, 5).map((row, idx) => (
                                            <tr key={idx} className="border-b">
                                                {Object.values(row).map((val: any, vidx) => (
                                                    <td key={vidx} className="p-2">{String(val)}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <p className="text-xs text-gray-500 mt-2">
                                    Showing 5 of {previewData.length} total rows
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleImport}
                        disabled={loading || !sheetValid}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {loading ? 'Importing...' : 'Import Contacts'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
