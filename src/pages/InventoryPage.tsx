import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Box,
  Plus,
  FileText,
  ArrowDown,
  ArrowUp,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { 
  getInventoryItems, 
  createInventoryItem, 
  getInventoryStats,
  getOpenPOCount,
  type InventoryItem 
} from '@/lib/inventory-api'
import { isSupabaseConfigured } from '@/lib/supabase'

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [isNewItemOpen, setIsNewItemOpen] = useState(false)
  const [newItemSku, setNewItemSku] = useState('')
  const [newItemName, setNewItemName] = useState('')
  const [newItemLocation, setNewItemLocation] = useState('')
  const [newItemQty, setNewItemQty] = useState('')
  const [newItemMinQty, setNewItemMinQty] = useState('')
  const [newItemReorderQty, setNewItemReorderQty] = useState('')
  const [newItemUnitCost, setNewItemUnitCost] = useState('')
  const [newItemSupplier, setNewItemSupplier] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('')
  const [newItemBarcode, setNewItemBarcode] = useState('')
  
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ totalItems: 0, lowStockItems: 0, outOfStockItems: 0, totalValue: 0 })
  const [openPOCount, setOpenPOCount] = useState(0)

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [itemsData, statsData, poCount] = await Promise.all([
        getInventoryItems(),
        getInventoryStats(),
        getOpenPOCount()
      ])
      setItems(itemsData)
      setStats(statsData)
      setOpenPOCount(poCount)
    } catch (error) {
      console.error('Error fetching inventory data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!newItemSku || !newItemName || !newItemLocation || !newItemQty || !newItemMinQty || !newItemUnitCost) {
      alert("Please fill in all required fields")
      return
    }

    setSaving(true)
    try {
      const qty = parseInt(newItemQty)
      const minQty = parseInt(newItemMinQty)
      const unitCost = parseFloat(newItemUnitCost)
      
      const status: 'in-stock' | 'low-stock' | 'out-of-stock' = 
        qty <= 0 ? 'out-of-stock' : qty <= minQty ? 'low-stock' : 'in-stock'

      const newItem = await createInventoryItem({
        sku: newItemSku,
        product_name: newItemName,
        location: newItemLocation,
        on_hand_qty: qty,
        min_qty: minQty,
        reorder_qty: parseInt(newItemReorderQty) || minQty * 2,
        unit_cost: unitCost,
        allocated: 0,
        supplier_id: null,
        supplier_name: newItemSupplier || null,
        status,
        barcode: newItemBarcode || null,
        image_url: null,
        category: newItemCategory || null,
        description: null,
        last_movement_at: null,
        is_active: true,
      })

      if (newItem) {
        setItems([...items, newItem])
        // Reset form
        resetForm()
        setIsNewItemOpen(false)
        // Refresh stats
        const newStats = await getInventoryStats()
        setStats(newStats)
      }
    } catch (error) {
      console.error('Error creating item:', error)
      alert('Failed to create item')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setNewItemSku('')
    setNewItemName('')
    setNewItemLocation('')
    setNewItemQty('')
    setNewItemMinQty('')
    setNewItemReorderQty('')
    setNewItemUnitCost('')
    setNewItemSupplier('')
    setNewItemCategory('')
    setNewItemBarcode('')
  }

  const filteredItems = items.filter(
    (item) =>
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
  )

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock':
        return 'bg-green-500/10 text-green-600 border-green-500/20'
      case 'low-stock':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20'
      case 'out-of-stock':
        return 'bg-red-500/10 text-red-600 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20'
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 text-center">
            <Box className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Supabase Not Configured</h2>
            <p className="text-muted-foreground mb-4">
              Please configure your Supabase environment variables to use the inventory module.
            </p>
            <p className="text-sm text-muted-foreground">
              Set <code className="bg-muted px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
              <code className="bg-muted px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in your .env file.
            </p>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 -mx-6 px-6 mb-6">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <span className="hover:text-foreground cursor-pointer transition-colors">Home</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Inventory Management</span>
              </div>
              
              {/* Title with Icon */}
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-lg">
                  <Box className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">Inventory Management</h1>
              </div>
              
              <p className="text-muted-foreground mt-2">Real-time stock management and tracking</p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Item
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="space-y-6">

        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-3xl font-bold">{loading ? '-' : stats.totalItems}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600">{loading ? '-' : stats.lowStockItems}</p>
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Open POs</p>
              <p className="text-3xl font-bold text-blue-600">{loading ? '-' : openPOCount}</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card 
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setIsNewItemOpen(true)}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">New Item</p>
                <p className="text-sm text-muted-foreground">Create SKU</p>
              </div>
            </div>
          </Card>
          <Link to="/inventory/purchase-orders">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">New PO</p>
                  <p className="text-sm text-muted-foreground">Purchase order</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/inventory/scan-in">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <ArrowDown className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Scan-In</p>
                  <p className="text-sm text-muted-foreground">Receive stock</p>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/inventory/check-out">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <ArrowUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="font-semibold">Check-Out</p>
                  <p className="text-sm text-muted-foreground">Issue stock</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Items Management Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Items</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items, SKU, barcode, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-80"
                  />
                </div>
                <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>

            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">SKU</th>
                    <th className="text-left p-4 font-medium">Product Name</th>
                    <th className="text-left p-4 font-medium">Location</th>
                    <th className="text-left p-4 font-medium">On Hand Qty</th>
                    <th className="text-left p-4 font-medium">Min Qty</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                        <p className="text-muted-foreground">Loading inventory...</p>
                      </td>
                    </tr>
                  ) : paginatedItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        {searchQuery ? 'No items match your search' : 'No inventory items yet. Add your first item!'}
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-mono text-sm">{item.sku}</td>
                        <td className="p-4">{item.product_name}</td>
                        <td className="p-4 font-mono text-sm">{item.location || '-'}</td>
                        <td className="p-4 font-semibold">{item.on_hand_qty}</td>
                        <td className="p-4 text-muted-foreground">{item.min_qty}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status === 'in-stock' && 'In Stock'}
                            {item.status === 'low-stock' && 'Low Stock'}
                            {item.status === 'out-of-stock' && 'Out of Stock'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Link to={`/inventory/items/${item.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && filteredItems.length > 0 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredItems.length)} of{' '}
                  {filteredItems.length} items
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* New Item Dialog */}
        <Dialog open={isNewItemOpen} onOpenChange={setIsNewItemOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>Create a new SKU in the inventory system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-sku">SKU *</Label>
                  <Input 
                    id="item-sku"
                    placeholder="Enter SKU code"
                    value={newItemSku}
                    onChange={(e) => setNewItemSku(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="item-name">Product Name *</Label>
                  <Input 
                    id="item-name"
                    placeholder="Enter product name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-location">Location *</Label>
                  <Input 
                    id="item-location"
                    placeholder="e.g., A1-B2-C3"
                    value={newItemLocation}
                    onChange={(e) => setNewItemLocation(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="item-category">Category</Label>
                  <Select value={newItemCategory} onValueChange={setNewItemCategory}>
                    <SelectTrigger id="item-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Tools">Tools</SelectItem>
                      <SelectItem value="Components">Components</SelectItem>
                      <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                      <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="item-qty">Initial Quantity *</Label>
                  <Input 
                    id="item-qty"
                    type="number"
                    placeholder="0"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="item-min-qty">Min Quantity *</Label>
                  <Input 
                    id="item-min-qty"
                    type="number"
                    placeholder="0"
                    value={newItemMinQty}
                    onChange={(e) => setNewItemMinQty(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="item-reorder-qty">Reorder Quantity</Label>
                  <Input 
                    id="item-reorder-qty"
                    type="number"
                    placeholder="Auto-calculated"
                    value={newItemReorderQty}
                    onChange={(e) => setNewItemReorderQty(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="item-unit-cost">Unit Cost *</Label>
                  <Input 
                    id="item-unit-cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItemUnitCost}
                    onChange={(e) => setNewItemUnitCost(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="item-supplier">Supplier</Label>
                  <Input 
                    id="item-supplier"
                    placeholder="Enter supplier name"
                    value={newItemSupplier}
                    onChange={(e) => setNewItemSupplier(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="item-barcode">Barcode</Label>
                <Input 
                  id="item-barcode"
                  placeholder="Enter barcode (optional)"
                  value={newItemBarcode}
                  onChange={(e) => setNewItemBarcode(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleAddItem} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Item'
                  )}
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsNewItemOpen(false)
                  resetForm()
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  )
}
