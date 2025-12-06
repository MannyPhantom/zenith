import { supabase, isSupabaseConfigured } from './supabase'

// ============================================
// TYPES
// ============================================

export interface InventoryItem {
  id: string
  sku: string
  product_name: string
  location: string | null
  on_hand_qty: number
  min_qty: number
  reorder_qty: number
  unit_cost: number
  total_value: number
  allocated: number
  supplier_id: string | null
  supplier_name: string | null
  status: 'in-stock' | 'low-stock' | 'out-of-stock'
  barcode: string | null
  image_url: string | null
  category: string | null
  description: string | null
  last_movement_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryMovement {
  id: string
  item_id: string
  movement_date: string
  reason: string
  change_qty: number
  reference: string | null
  user_name: string | null
  notes: string | null
  created_at: string
}

export interface PurchaseOrder {
  id: string
  po_number: string
  supplier_id: string | null
  supplier_name: string
  status: 'draft' | 'open' | 'pending' | 'received' | 'cancelled'
  total: number
  notes: string | null
  created_date: string
  expected_date: string | null
  received_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  line_items?: POLineItem[]
}

export interface POLineItem {
  id: string
  po_id: string
  item_id: string | null
  sku: string
  product_name: string
  quantity: number
  received_qty: number
  unit_cost: number
  total: number
  created_at: string
  updated_at: string
}

export interface Supplier {
  id: string
  name: string
  contact_name: string | null
  email: string | null
  phone: string | null
  address: string | null
  performance_score: number
  lead_time: number
  total_orders: number
  on_time_delivery: number
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryTransaction {
  id: string
  type: 'scan-in' | 'check-out'
  item_id: string
  sku: string
  product_name: string
  quantity: number
  transaction_date: string
  user_name: string | null
  reference: string | null
  notes: string | null
  created_at: string
}

// ============================================
// INVENTORY ITEMS API
// ============================================

export async function getInventoryItems(): Promise<InventoryItem[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured - returning empty array')
    return []
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .order('product_name')

  if (error) {
    console.error('Error fetching inventory items:', error)
    throw error
  }

  return data || []
}

export async function getInventoryItem(id: string): Promise<InventoryItem | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching inventory item:', error)
    return null
  }

  return data
}

export async function getInventoryItemBySku(sku: string): Promise<InventoryItem | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .or(`sku.ilike.${sku},barcode.eq.${sku}`)
    .single()

  if (error) {
    console.error('Error fetching inventory item by SKU:', error)
    return null
  }

  return data
}

export async function createInventoryItem(item: Omit<InventoryItem, 'id' | 'total_value' | 'created_at' | 'updated_at'>): Promise<InventoryItem | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .insert(item)
    .select()
    .single()

  if (error) {
    console.error('Error creating inventory item:', error)
    throw error
  }

  return data
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  // Remove computed fields
  const { total_value, created_at, updated_at, ...updateData } = updates

  const { data, error } = await supabase
    .from('inventory_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating inventory item:', error)
    throw error
  }

  return data
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return false
  }

  // Soft delete
  const { error } = await supabase
    .from('inventory_items')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    console.error('Error deleting inventory item:', error)
    return false
  }

  return true
}

// ============================================
// INVENTORY MOVEMENTS API
// ============================================

export async function getInventoryMovements(itemId?: string): Promise<InventoryMovement[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured - returning empty array')
    return []
  }

  let query = supabase
    .from('inventory_movements')
    .select('*')
    .order('movement_date', { ascending: false })

  if (itemId) {
    query = query.eq('item_id', itemId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching inventory movements:', error)
    throw error
  }

  return data || []
}

export async function createInventoryMovement(movement: Omit<InventoryMovement, 'id' | 'created_at'>): Promise<InventoryMovement | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('inventory_movements')
    .insert(movement)
    .select()
    .single()

  if (error) {
    console.error('Error creating inventory movement:', error)
    throw error
  }

  // Update the item's on_hand_qty and last_movement_at
  if (data) {
    const { error: updateError } = await supabase.rpc('increment_inventory_qty', {
      item_id: movement.item_id,
      qty_change: movement.change_qty
    }).single()

    // If RPC doesn't exist, do manual update
    if (updateError) {
      const item = await getInventoryItem(movement.item_id)
      if (item) {
        await updateInventoryItem(movement.item_id, {
          on_hand_qty: item.on_hand_qty + movement.change_qty,
          last_movement_at: new Date().toISOString()
        })
      }
    }
  }

  return data
}

// ============================================
// PURCHASE ORDERS API
// ============================================

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured - returning empty array')
    return []
  }

  const { data, error } = await supabase
    .from('purchase_orders')
    .select('*')
    .order('created_date', { ascending: false })

  if (error) {
    console.error('Error fetching purchase orders:', error)
    throw error
  }

  return data || []
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  const { data: poData, error: poError } = await supabase
    .from('purchase_orders')
    .select('*')
    .eq('id', id)
    .single()

  if (poError) {
    console.error('Error fetching purchase order:', poError)
    return null
  }

  // Fetch line items
  const { data: lineItems, error: lineError } = await supabase
    .from('po_line_items')
    .select('*')
    .eq('po_id', id)

  if (lineError) {
    console.error('Error fetching PO line items:', lineError)
  }

  return {
    ...poData,
    line_items: lineItems || []
  }
}

export async function createPurchaseOrder(po: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'line_items'>, lineItems?: Omit<POLineItem, 'id' | 'po_id' | 'total' | 'created_at' | 'updated_at'>[]): Promise<PurchaseOrder | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('purchase_orders')
    .insert(po)
    .select()
    .single()

  if (error) {
    console.error('Error creating purchase order:', error)
    throw error
  }

  // Insert line items if provided
  if (data && lineItems && lineItems.length > 0) {
    const lineItemsWithPoId = lineItems.map(item => ({
      ...item,
      po_id: data.id
    }))

    const { error: lineError } = await supabase
      .from('po_line_items')
      .insert(lineItemsWithPoId)

    if (lineError) {
      console.error('Error creating PO line items:', lineError)
    }
  }

  return data
}

export async function updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  // Remove computed fields and relations
  const { line_items, created_at, updated_at, ...updateData } = updates

  const { data, error } = await supabase
    .from('purchase_orders')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating purchase order:', error)
    throw error
  }

  return data
}

export async function deletePurchaseOrder(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return false
  }

  const { error } = await supabase
    .from('purchase_orders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting purchase order:', error)
    return false
  }

  return true
}

// ============================================
// PO LINE ITEMS API
// ============================================

export async function getPOLineItems(poId: string): Promise<POLineItem[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured - returning empty array')
    return []
  }

  const { data, error } = await supabase
    .from('po_line_items')
    .select('*')
    .eq('po_id', poId)

  if (error) {
    console.error('Error fetching PO line items:', error)
    throw error
  }

  return data || []
}

export async function createPOLineItem(lineItem: Omit<POLineItem, 'id' | 'total' | 'created_at' | 'updated_at'>): Promise<POLineItem | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('po_line_items')
    .insert(lineItem)
    .select()
    .single()

  if (error) {
    console.error('Error creating PO line item:', error)
    throw error
  }

  return data
}

export async function updatePOLineItem(id: string, updates: Partial<POLineItem>): Promise<POLineItem | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  const { total, created_at, updated_at, ...updateData } = updates

  const { data, error } = await supabase
    .from('po_line_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating PO line item:', error)
    throw error
  }

  return data
}

export async function deletePOLineItem(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return false
  }

  const { error } = await supabase
    .from('po_line_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting PO line item:', error)
    return false
  }

  return true
}

// ============================================
// SUPPLIERS API
// ============================================

export async function getSuppliers(): Promise<Supplier[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured - returning empty array')
    return []
  }

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Error fetching suppliers:', error)
    throw error
  }

  return data || []
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching supplier:', error)
    return null
  }

  return data
}

export async function createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('suppliers')
    .insert(supplier)
    .select()
    .single()

  if (error) {
    console.error('Error creating supplier:', error)
    throw error
  }

  return data
}

export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  const { created_at, updated_at, ...updateData } = updates

  const { data, error } = await supabase
    .from('suppliers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating supplier:', error)
    throw error
  }

  return data
}

export async function deleteSupplier(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return false
  }

  // Soft delete
  const { error } = await supabase
    .from('suppliers')
    .update({ is_active: false })
    .eq('id', id)

  if (error) {
    console.error('Error deleting supplier:', error)
    return false
  }

  return true
}

// ============================================
// INVENTORY TRANSACTIONS API
// ============================================

export async function getInventoryTransactions(): Promise<InventoryTransaction[]> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured - returning empty array')
    return []
  }

  const { data, error } = await supabase
    .from('inventory_transactions')
    .select('*')
    .order('transaction_date', { ascending: false })

  if (error) {
    console.error('Error fetching inventory transactions:', error)
    throw error
  }

  return data || []
}

export async function createInventoryTransaction(transaction: Omit<InventoryTransaction, 'id' | 'created_at'>): Promise<InventoryTransaction | null> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured')
    return null
  }

  const { data, error } = await supabase
    .from('inventory_transactions')
    .insert(transaction)
    .select()
    .single()

  if (error) {
    console.error('Error creating inventory transaction:', error)
    throw error
  }

  // Update inventory quantity based on transaction type
  if (data) {
    const qtyChange = transaction.type === 'scan-in' ? transaction.quantity : -transaction.quantity
    const item = await getInventoryItem(transaction.item_id)
    if (item) {
      await updateInventoryItem(transaction.item_id, {
        on_hand_qty: item.on_hand_qty + qtyChange,
        last_movement_at: new Date().toISOString()
      })

      // Also create a movement record
      await supabase.from('inventory_movements').insert({
        item_id: transaction.item_id,
        movement_date: transaction.transaction_date,
        reason: transaction.type === 'scan-in' ? 'Scan In' : 'Check Out',
        change_qty: qtyChange,
        reference: transaction.reference,
        user_name: transaction.user_name,
        notes: transaction.notes
      })
    }
  }

  return data
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export async function generatePONumber(): Promise<string> {
  if (!isSupabaseConfigured) {
    const now = new Date()
    return `PO-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  }

  const { data, error } = await supabase.rpc('generate_po_number')

  if (error) {
    console.error('Error generating PO number:', error)
    // Fallback to local generation
    const now = new Date()
    return `PO-${now.getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
  }

  return data
}

// Scan-in operation with inventory update
export async function performScanIn(
  itemId: string,
  quantity: number,
  reference?: string,
  userName?: string,
  notes?: string
): Promise<{ success: boolean; item?: InventoryItem; error?: string }> {
  try {
    const item = await getInventoryItem(itemId)
    if (!item) {
      return { success: false, error: 'Item not found' }
    }

    // Create transaction
    await createInventoryTransaction({
      type: 'scan-in',
      item_id: itemId,
      sku: item.sku,
      product_name: item.product_name,
      quantity,
      transaction_date: new Date().toISOString(),
      user_name: userName || 'System',
      reference: reference || null,
      notes: notes || null
    })

    // Fetch updated item
    const updatedItem = await getInventoryItem(itemId)
    return { success: true, item: updatedItem || undefined }
  } catch (error) {
    console.error('Error performing scan-in:', error)
    return { success: false, error: 'Failed to perform scan-in' }
  }
}

// Check-out operation with inventory update
export async function performCheckOut(
  itemId: string,
  quantity: number,
  reference?: string,
  userName?: string,
  notes?: string
): Promise<{ success: boolean; item?: InventoryItem; error?: string }> {
  try {
    const item = await getInventoryItem(itemId)
    if (!item) {
      return { success: false, error: 'Item not found' }
    }

    if (item.on_hand_qty - item.allocated < quantity) {
      return { success: false, error: 'Insufficient available quantity' }
    }

    // Create transaction
    await createInventoryTransaction({
      type: 'check-out',
      item_id: itemId,
      sku: item.sku,
      product_name: item.product_name,
      quantity,
      transaction_date: new Date().toISOString(),
      user_name: userName || 'System',
      reference: reference || null,
      notes: notes || null
    })

    // Fetch updated item
    const updatedItem = await getInventoryItem(itemId)
    return { success: true, item: updatedItem || undefined }
  } catch (error) {
    console.error('Error performing check-out:', error)
    return { success: false, error: 'Failed to perform check-out' }
  }
}

// Get inventory statistics
export async function getInventoryStats(): Promise<{
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  totalValue: number
}> {
  if (!isSupabaseConfigured) {
    return { totalItems: 0, lowStockItems: 0, outOfStockItems: 0, totalValue: 0 }
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .select('status, total_value')
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching inventory stats:', error)
    return { totalItems: 0, lowStockItems: 0, outOfStockItems: 0, totalValue: 0 }
  }

  const items = data || []
  return {
    totalItems: items.length,
    lowStockItems: items.filter(i => i.status === 'low-stock').length,
    outOfStockItems: items.filter(i => i.status === 'out-of-stock').length,
    totalValue: items.reduce((sum, i) => sum + (i.total_value || 0), 0)
  }
}

// Get open purchase orders count
export async function getOpenPOCount(): Promise<number> {
  if (!isSupabaseConfigured) {
    return 0
  }

  const { count, error } = await supabase
    .from('purchase_orders')
    .select('*', { count: 'exact', head: true })
    .in('status', ['open', 'pending'])

  if (error) {
    console.error('Error fetching open PO count:', error)
    return 0
  }

  return count || 0
}
