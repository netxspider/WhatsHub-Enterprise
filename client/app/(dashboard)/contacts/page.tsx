'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Search,
    Download,
    UserPlus,
    MoreVertical,
    FileSpreadsheet,
    User,
    CheckCircle2,
    AlertCircle,
    MessageSquare,
    Trash2,
    Tag,
    Send,
    Mail,
    MapPin,
    Clock
} from 'lucide-react'

// Mock data with Indian names and businesses
const mockContacts = [
    { id: 1, name: 'Arjun Singh', phone: '+91 98765 43210', email: 'arjun@example.com', tags: ['VIP', 'Wholesaler'], source: 'sheet', status: 'valid', lastActive: '2h ago', address: 'Jalandhar, Punjab', activity: ['Received Welcome Message - Yesterday', 'Replied "Interested" - 2 days ago', 'Imported from Leads.csv - 1 week ago'] },
    { id: 2, name: 'Priya Kapoor', phone: '+91 99876 54321', email: 'priya.k@example.com', tags: ['New', 'Retailer'], source: 'manual', status: 'valid', lastActive: '5h ago', address: 'Amritsar, Punjab', activity: ['Campaign Sent - Today', 'Added manually - 3 days ago'] },
    { id: 3, name: 'Manpreet Kaur', phone: '+91 98123 45678', email: 'manpreet@example.com', tags: ['Customer'], source: 'sheet', status: 'valid', lastActive: '1d ago', address: 'Ludhiana, Punjab', activity: ['Replied to campaign - Yesterday', 'Imported from Sheet - 2 weeks ago'] },
    { id: 4, name: 'Rahul Sharma', phone: '+91 97654 32109', email: 'rahul.s@example.com', tags: ['Lead', 'Pending Payment'], source: 'manual', status: 'valid', lastActive: '3h ago', address: 'Chandigarh', activity: ['Viewed product link - Today', 'Added from website - 5 days ago'] },
    { id: 5, name: 'Simran Bhatia', phone: '+91 96543 21098', email: '', tags: ['VIP', 'Wholesaler'], source: 'sheet', status: '...', lastActive: '12h ago', address: 'Delhi', activity: ['Large order placed - Yesterday'] },
    { id: 6, name: 'Vikram Mehta', phone: '+91 95432 10987', email: 'vikram@example.com', tags: ['Retailer'], source: 'manual', status: 'valid', lastActive: '30m ago', address: 'Jalandhar, Punjab', activity: ['Messaged support - 30m ago'] },
    { id: 7, name: 'Anjali Patel', phone: '+91 94321 09876', email: 'anjali.p@example.com', tags: ['Customer', 'Loyal'], source: 'sheet', status: 'valid', lastActive: '1d ago', address: 'Mumbai, Maharashtra', activity: ['Repeat purchase - 3 days ago'] },
    { id: 8, name: 'Karan Gill', phone: '+91 93210 98765', email: '', tags: ['Lead'], source: 'manual', status: 'invalid', lastActive: '2d ago', address: 'Bangalore, Karnataka', activity: ['Failed to deliver - Yesterday'] },
    { id: 9, name: 'Neha Reddy', phone: '+91 92109 87654', email: 'neha.r@example.com', tags: ['New', 'Customer'], source: 'sheet', status: 'valid', lastActive: '6h ago', address: 'Hyderabad, Telangana', activity: ['First purchase - Today'] },
    { id: 10, name: 'Amit Verma', phone: '+91 91098 76543', email: 'amit.v@example.com', tags: ['Wholesaler', 'VIP'], source: 'manual', status: 'valid', lastActive: '1h ago', address: 'Gurgaon, Haryana', activity: ['Bulk order inquiry - 1h ago'] },
]

export default function ContactsPage() {
    const [contacts, setContacts] = useState(mockContacts)
    const [selectedContact, setSelectedContact] = useState<typeof mockContacts[0] | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedContacts, setSelectedContacts] = useState<number[]>([])
    const [filterTag, setFilterTag] = useState('all')
    const [filterSource, setFilterSource] = useState('all')

    // Filter contacts
    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.phone.includes(searchQuery)
        const matchesTag = filterTag === 'all' || contact.tags.includes(filterTag)
        const matchesSource = filterSource === 'all' || contact.source === filterSource
        return matchesSearch && matchesTag && matchesSource
    })

    const handleRowClick = (contact: typeof mockContacts[0]) => {
        setSelectedContact(contact)
        setSheetOpen(true)
    }

    const handleSelectContact = (id: number) => {
        setSelectedContacts(prev =>
            prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
        )
    }

    const handleSelectAll = () => {
        if (selectedContacts.length === filteredContacts.length) {
            setSelectedContacts([])
        } else {
            setSelectedContacts(filteredContacts.map(c => c.id))
        }
    }

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase()
    }

    const getAvatarColor = (id: number) => {
        const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500',
            'bg-pink-500', 'bg-yellow-500', 'bg-indigo-500'
        ]
        return colors[id % colors.length]
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        Contacts
                        <Badge variant="secondary" className="text-sm">
                            {filteredContacts.length} contacts
                        </Badge>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your customer database</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="lg">
                        <UserPlus className="mr-2 h-5 w-5" />
                        Add Contact
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" size="lg">
                        <FileSpreadsheet className="mr-2 h-5 w-5" />
                        Import from Sheets
                    </Button>
                </div>
            </div>

            {/* Filters & Search */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by name or phone number..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <select
                        className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                        value={filterTag}
                        onChange={(e) => setFilterTag(e.target.value)}
                    >
                        <option value="all">All Tags</option>
                        <option value="VIP">VIP</option>
                        <option value="Lead">Lead</option>
                        <option value="Customer">Customer</option>
                        <option value="Wholesaler">Wholesaler</option>
                        <option value="Retailer">Retailer</option>
                    </select>
                    <select
                        className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                    >
                        <option value="all">All Sources</option>
                        <option value="sheet">Google Sheets</option>
                        <option value="manual">Manual Entry</option>
                    </select>
                </div>
            </Card>

            {/* Bulk Actions Bar */}
            {selectedContacts.length > 0 && (
                <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600">{selectedContacts.length} selected</Badge>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Tag className="mr-2 h-4 w-4" />
                                Add Tag
                            </Button>
                            <Button variant="outline" size="sm">
                                <Send className="mr-2 h-4 w-4" />
                                Add to Campaign
                            </Button>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Selected
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Data Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedContacts.length === filteredContacts.length}
                                    onChange={handleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Profile</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Tags</TableHead>
                            <TableHead>Source</TableHead>
                            <TableHead>WA Status</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredContacts.map((contact) => (
                            <TableRow
                                key={contact.id}
                                className="cursor-pointer"
                                onClick={() => handleRowClick(contact)}
                            >
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Checkbox
                                        checked={selectedContacts.includes(contact.id)}
                                        onChange={() => handleSelectContact(contact.id)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className={`h-10 w-10 rounded-full ${getAvatarColor(contact.id)} flex items-center justify-center text-white font-semibold`}>
                                        {getInitials(contact.name)}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{contact.name}</TableCell>
                                <TableCell className="font-mono text-sm">{contact.phone}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {contact.tags.map(tag => (
                                            <Badge
                                                key={tag}
                                                variant={tag === 'VIP' ? 'destructive' : 'default'}
                                                className={
                                                    tag === 'New' ? 'bg-blue-100 text-blue-800' :
                                                        tag === 'Wholesaler' ? 'bg-purple-100 text-purple-800' :
                                                            tag === 'Retailer' ? 'bg-green-100 text-green-800' :
                                                                ''
                                                }
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {contact.source === 'sheet' ? (
                                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <User className="h-4 w-4 text-gray-600" />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {contact.status === 'valid' ? (
                                        <div className="flex items-center gap-1 text-green-600">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span className="text-sm">Valid</span>
                                        </div>
                                    ) : contact.status === 'invalid' ? (
                                        <div className="flex items-center gap-1 text-red-600">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-sm">Invalid</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">{contact.lastActive}</TableCell>
                                <TableCell onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Contact Details Sheet */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                    {selectedContact && (
                        <>
                            <SheetHeader className="mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`h-16 w-16 rounded-full ${getAvatarColor(selectedContact.id)} flex items-center justify-center text-white text-2xl font-bold`}>
                                        {getInitials(selectedContact.name)}
                                    </div>
                                    <div>
                                        <SheetTitle className="text-2xl">{selectedContact.name}</SheetTitle>
                                        <SheetDescription className="font-mono mt-1">{selectedContact.phone}</SheetDescription>
                                    </div>
                                </div>
                            </SheetHeader>

                            {/* Quick Action */}
                            <Button className="w-full bg-green-600 hover:bg-green-700 mb-6" size="lg">
                                <MessageSquare className="mr-2 h-5 w-5" />
                                Message on WhatsApp
                            </Button>

                            {/* Contact Details */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Contact Information</h3>
                                    <div className="space-y-3">
                                        {selectedContact.email && (
                                            <div className="flex items-center gap-3 text-sm">
                                                <Mail className="h-4 w-4 text-gray-400" />
                                                <span>{selectedContact.email}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 text-sm">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                            <span>{selectedContact.address}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span>Last active: {selectedContact.lastActive}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Tags</h3>
                                    <div className="flex gap-2 flex-wrap">
                                        {selectedContact.tags.map(tag => (
                                            <Badge key={tag}>{tag}</Badge>
                                        ))}
                                        <Button variant="outline" size="sm">
                                            <Tag className="h-3 w-3 mr-1" />
                                            Add Tag
                                        </Button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Activity Timeline</h3>
                                    <div className="space-y-3">
                                        {selectedContact.activity.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 text-sm">
                                                <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5"></div>
                                                <span className="text-gray-600 dark:text-gray-300">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
