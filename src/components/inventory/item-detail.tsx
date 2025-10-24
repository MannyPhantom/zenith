"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Edit, ArrowDown, ArrowUp, Package, DollarSign, MapPin, TrendingUp, Calendar, Upload } from "lucide-react"
import { inventoryItems, inventoryMovements } from "@/lib/inventory-data"
import { Link } from "react-router-dom"

interface ItemDetailProps {
  itemId: string
}

export function ItemDetail({ itemId }: ItemDetailProps) {
  const [item, setItem] = useState(inventoryItems.find((i) => i.id === itemId))
  const [movements, setMovements] = useState(inventoryMovements.filter((m) => m.itemId === itemId))
  
  // Dialog states
  const [isScanInOpen, setIsScanInOpen] = useState(false)
  const [isScanOutOpen, setIsScanOutOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  
  // Form states
  const [scanInQty, setScanInQty] = useState('')
  const [scanInReason, setScanInReason] = useState('')
  const [scanInReference, setScanInReference] = useState('')
  const [scanOutQty, setScanOutQty] = useState('')
  const [scanOutReason, setScanOutReason] = useState('')
  const [scanOutReference, setScanOutReference] = useState('')
  
  // Edit form states
  const [editName, setEditName] = useState(item?.productName || '')
  const [editLocation, setEditLocation] = useState(item?.location || '')
  const [editMinQty, setEditMinQty] = useState(item?.minQty.toString() || '')
  const [editReorderQty, setEditReorderQty] = useState(item?.reorderQty.toString() || '')
  const [editUnitCost, setEditUnitCost] = useState(item?.unitCost.toString() || '')
  const [editSupplier, setEditSupplier] = useState(item?.supplier || '')
  const [editCategory, setEditCategory] = useState(item?.category || '')

  // Handler functions
  const handleScanIn = () => {
    if (!scanInQty || !scanInReason) {
      alert("Please fill in quantity and reason")
      return
    }

    const qty = parseInt(scanInQty)
    const newQty = item!.onHandQty + qty
    const newTotalValue = newQty * item!.unitCost
    const newStatus = newQty <= 0 ? "out-of-stock" : newQty <= item!.minQty ? "low-stock" : "in-stock"

    // Update item
    const updatedItem = {
      ...item!,
      onHandQty: newQty,
      totalValue: newTotalValue,
      status: newStatus as "in-stock" | "low-stock" | "out-of-stock",
      lastMovement: new Date(),
    }
    setItem(updatedItem)

    // Add movement record
    const newMovement = {
      id: `mov${movements.length + 1}`,
      itemId: itemId,
      date: new Date(),
      reason: scanInReason,
      change: qty,
      reference: scanInReference || `IN-${Date.now()}`,
      user: "Current User",
    }
    setMovements([newMovement, ...movements])

    // Reset form
    setScanInQty('')
    setScanInReason('')
    setScanInReference('')
    setIsScanInOpen(false)
  }

  const handleScanOut = () => {
    if (!scanOutQty || !scanOutReason) {
      alert("Please fill in quantity and reason")
      return
    }

    const qty = parseInt(scanOutQty)
    if (qty > item!.onHandQty) {
      alert("Cannot scan out more than available quantity")
      return
    }

    const newQty = item!.onHandQty - qty
    const newTotalValue = newQty * item!.unitCost
    const newStatus = newQty <= 0 ? "out-of-stock" : newQty <= item!.minQty ? "low-stock" : "in-stock"

    // Update item
    const updatedItem = {
      ...item!,
      onHandQty: newQty,
      totalValue: newTotalValue,
      status: newStatus as "in-stock" | "low-stock" | "out-of-stock",
      lastMovement: new Date(),
    }
    setItem(updatedItem)

    // Add movement record
    const newMovement = {
      id: `mov${movements.length + 1}`,
      itemId: itemId,
      date: new Date(),
      reason: scanOutReason,
      change: -qty,
      reference: scanOutReference || `OUT-${Date.now()}`,
      user: "Current User",
    }
    setMovements([newMovement, ...movements])

    // Reset form
    setScanOutQty('')
    setScanOutReason('')
    setScanOutReference('')
    setIsScanOutOpen(false)
  }

  const handleEditItem = () => {
    if (!editName || !editLocation || !editMinQty || !editUnitCost) {
      alert("Please fill in all required fields")
      return
    }

    const minQty = parseInt(editMinQty)
    const unitCost = parseFloat(editUnitCost)
    const newTotalValue = item!.onHandQty * unitCost
    const newStatus = item!.onHandQty <= 0 ? "out-of-stock" : item!.onHandQty <= minQty ? "low-stock" : "in-stock"

    const updatedItem = {
      ...item!,
      productName: editName,
      location: editLocation,
      minQty: minQty,
      reorderQty: parseInt(editReorderQty) || minQty * 2,
      unitCost: unitCost,
      totalValue: newTotalValue,
      supplier: editSupplier,
      category: editCategory,
      status: newStatus as "in-stock" | "low-stock" | "out-of-stock",
      lastMovement: new Date(),
    }
    setItem(updatedItem)
    setIsEditOpen(false)
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <p>Item not found</p>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "low-stock":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "out-of-stock":
        return "bg-red-500/10 text-red-600 border-red-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/inventory">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{item.productName}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-sm text-muted-foreground font-mono">{item.sku}</span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{item.location}</span>
                <Badge className={getStatusColor(item.status)}>
                  {item.status === "in-stock" && "In Stock"}
                  {item.status === "low-stock" && "Low Stock"}
                  {item.status === "out-of-stock" && "Out of Stock"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isScanInOpen} onOpenChange={setIsScanInOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ArrowDown className="w-4 h-4 mr-2" />
                  Scan In
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={isScanOutOpen} onOpenChange={setIsScanOutOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Scan Out
                </Button>
              </DialogTrigger>
            </Dialog>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Item Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">On Hand</p>
                    <p className="text-2xl font-bold">{item.onHandQty}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Min Qty</p>
                    <p className="text-2xl font-bold">{item.minQty}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unit Cost</p>
                    <p className="text-2xl font-bold">${item.unitCost}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="text-lg font-bold font-mono">{item.location}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Item Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Item Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Supplier</p>
                  <p className="font-medium">{item.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{item.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Barcode</p>
                  <p className="font-mono text-sm">{item.barcode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reorder Qty</p>
                  <p className="font-medium">{item.reorderQty}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Allocated</p>
                  <p className="font-medium">{item.allocated}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="font-medium">${item.totalValue.toFixed(2)}</p>
                </div>
              </div>
            </Card>

            {/* Recent Movements */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Movements</h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Reason</th>
                      <th className="text-left p-4 font-medium">Change</th>
                      <th className="text-left p-4 font-medium">Reference</th>
                      <th className="text-left p-4 font-medium">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.length > 0 ? (
                      movements.map((movement) => (
                        <tr key={movement.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="p-4 text-sm">{movement.date.toLocaleDateString()}</td>
                          <td className="p-4">{movement.reason}</td>
                          <td className="p-4">
                            <span
                              className={`font-semibold ${movement.change > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {movement.change > 0 ? "+" : ""}
                              {movement.change}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-sm">{movement.reference}</td>
                          <td className="p-4 text-sm">{movement.user}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                          No movements recorded
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Right Panel - Image & Quick Actions */}
          <div className="space-y-6">
            {/* Item Image */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Item Image</h3>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <Package className="w-16 h-16 text-muted-foreground" />
              </div>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                </DialogTrigger>
              </Dialog>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <span className="font-semibold">{item.onHandQty - item.allocated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Allocated</span>
                  <span className="font-semibold">{item.allocated}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reorder Point</span>
                  <span className="font-semibold">{item.minQty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reorder Qty</span>
                  <span className="font-semibold">{item.reorderQty}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Value</span>
                    <span className="text-lg font-bold">${item.totalValue.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Last Movement */}
            {item.lastMovement && (
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Movement</p>
                    <p className="font-medium">{item.lastMovement.toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Scan In Dialog */}
        <Dialog open={isScanInOpen} onOpenChange={setIsScanInOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scan In Inventory</DialogTitle>
              <DialogDescription>Add stock to {item.productName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="scan-in-qty">Quantity to Add *</Label>
                <Input 
                  id="scan-in-qty"
                  type="number"
                  placeholder="Enter quantity"
                  value={scanInQty}
                  onChange={(e) => setScanInQty(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="scan-in-reason">Reason *</Label>
                <Select value={scanInReason} onValueChange={setScanInReason}>
                  <SelectTrigger id="scan-in-reason">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Purchase Order Received">Purchase Order Received</SelectItem>
                    <SelectItem value="Return from Customer">Return from Customer</SelectItem>
                    <SelectItem value="Manufacturing Completion">Manufacturing Completion</SelectItem>
                    <SelectItem value="Inventory Adjustment">Inventory Adjustment</SelectItem>
                    <SelectItem value="Transfer In">Transfer In</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scan-in-reference">Reference (Optional)</Label>
                <Input 
                  id="scan-in-reference"
                  placeholder="PO number, receipt, etc."
                  value={scanInReference}
                  onChange={(e) => setScanInReference(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleScanIn}>
                  <ArrowDown className="w-4 h-4 mr-2" />
                  Scan In Stock
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsScanInOpen(false)
                  setScanInQty('')
                  setScanInReason('')
                  setScanInReference('')
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Scan Out Dialog */}
        <Dialog open={isScanOutOpen} onOpenChange={setIsScanOutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scan Out Inventory</DialogTitle>
              <DialogDescription>Remove stock from {item.productName} (Available: {item.onHandQty})</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="scan-out-qty">Quantity to Remove *</Label>
                <Input 
                  id="scan-out-qty"
                  type="number"
                  placeholder="Enter quantity"
                  max={item.onHandQty}
                  value={scanOutQty}
                  onChange={(e) => setScanOutQty(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="scan-out-reason">Reason *</Label>
                <Select value={scanOutReason} onValueChange={setScanOutReason}>
                  <SelectTrigger id="scan-out-reason">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Customer Order">Customer Order</SelectItem>
                    <SelectItem value="Manufacturing Use">Manufacturing Use</SelectItem>
                    <SelectItem value="Damaged/Defective">Damaged/Defective</SelectItem>
                    <SelectItem value="Transfer Out">Transfer Out</SelectItem>
                    <SelectItem value="Inventory Adjustment">Inventory Adjustment</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="scan-out-reference">Reference (Optional)</Label>
                <Input 
                  id="scan-out-reference"
                  placeholder="Order number, work order, etc."
                  value={scanOutReference}
                  onChange={(e) => setScanOutReference(e.target.value)}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleScanOut}>
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Scan Out Stock
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsScanOutOpen(false)
                  setScanOutQty('')
                  setScanOutReason('')
                  setScanOutReference('')
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Item Details</DialogTitle>
              <DialogDescription>Update information for {item.sku}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Product Name *</Label>
                  <Input 
                    id="edit-name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-location">Location *</Label>
                  <Input 
                    id="edit-location"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-min-qty">Min Quantity *</Label>
                  <Input 
                    id="edit-min-qty"
                    type="number"
                    value={editMinQty}
                    onChange={(e) => setEditMinQty(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-reorder-qty">Reorder Quantity</Label>
                  <Input 
                    id="edit-reorder-qty"
                    type="number"
                    value={editReorderQty}
                    onChange={(e) => setEditReorderQty(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-unit-cost">Unit Cost *</Label>
                  <Input 
                    id="edit-unit-cost"
                    type="number"
                    step="0.01"
                    value={editUnitCost}
                    onChange={(e) => setEditUnitCost(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-supplier">Supplier</Label>
                  <Input 
                    id="edit-supplier"
                    value={editSupplier}
                    onChange={(e) => setEditSupplier(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger id="edit-category">
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
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleEditItem}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Upload Image Dialog */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Item Image</DialogTitle>
              <DialogDescription>Add or update image for {item.productName}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-upload">Select Image File</Label>
                <Input 
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      // Simulate image upload
                      alert(`Image "${e.target.files[0].name}" uploaded successfully!\n\nThis would integrate with your file storage system.`)
                      setIsUploadOpen(false)
                    }
                  }}
                />
              </div>
              <div className="text-center py-4 border-2 border-dashed border-muted rounded-lg">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop an image here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports JPG, PNG, GIF up to 5MB
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsUploadOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
