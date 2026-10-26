import { useState } from 'react'
import Card from '../components/Card'
import BillInvoice from '../components/BillInvoice'
import useFetch from '../hooks/useFetch'
import { createBill, getTodayBills, getWeekBills, getMonthBills } from '../services/billingService'
import { formatPrice, formatDate } from '../helpers/formatters'
import './Billing.css'

function Billing() {
  const { data: stockData } = useFetch('/stock')

  const [activeTab, setActiveTab] = useState('create') // 'create' | 'history'
  const [billsFilter, setBillsFilter] = useState('today')
  const [bills, setBills] = useState(null)
  const [billsLoading, setBillsLoading] = useState(false)
  const [billsError, setBillsError] = useState(null)
  const [previewBill, setPreviewBill] = useState(null)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)

  const [billData, setBillData] = useState({
    shopName: '',
    gst: false,
    customerGstNumber: '',
    skipStockCheck: false,
    products: [],
  })

  const [selectedProductKey, setSelectedProductKey] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [mrp, setMrp] = useState('')
  const [sellingPrice, setSellingPrice] = useState('')

  // Key stock items by "name||price" for uniqueness
  const getProductKey = (p) => `${p.name}||${p.mrp ?? p.sellingPrice ?? p.price}`

  const getSelectedStock = () => {
    if (!selectedProductKey || !stockData) return null
    return stockData.find((p) => getProductKey(p) === selectedProductKey) || null
  }

  const addProductToBill = () => {
    const stock = getSelectedStock()
    if (!stock) return

    const stockMrp = Number(stock.mrp ?? stock.sellingPrice ?? stock.price ?? 0)
    const stockSellingPrice = Number(stock.sellingPrice ?? stock.mrp ?? stock.price ?? 0)
    const parsedMrp = Number(mrp)
    const parsedSellingPrice = Number(sellingPrice)
    const safeMrp = Number.isFinite(parsedMrp) && parsedMrp > 0 ? parsedMrp : stockMrp
    const safeSellingPrice = Number.isFinite(parsedSellingPrice) && parsedSellingPrice > 0
      ? parsedSellingPrice
      : stockSellingPrice
    const existingIdx = billData.products.findIndex(
      (p) => p.productName === stock.name && p.mrp === safeMrp
    )

    if (existingIdx >= 0) {
      const updated = [...billData.products]
      updated[existingIdx] = {
        ...updated[existingIdx],
        qty: updated[existingIdx].qty + quantity,
        price: safeSellingPrice,
        mrp: safeMrp,
      }
      setBillData({ ...billData, products: updated })
    } else {
      setBillData({
        ...billData,
        products: [
          ...billData.products,
          {
            productName: stock.name,
            price: safeSellingPrice,
            mrp: safeMrp,
            qty: quantity,
          },
        ],
      })
    }

    setSelectedProductKey('')
    setQuantity(1)
    setMrp('')
    setSellingPrice('')
  }

  const removeProduct = (idx) => {
    setBillData({ ...billData, products: billData.products.filter((_, i) => i !== idx) })
  }

  const calculateSubtotal = () =>
    billData.products.reduce((sum, p) => sum + (Number(p.price ?? p.sellingPrice ?? p.mrp ?? 0) * Number(p.qty || 0)), 0)

  const canCreate = billData.shopName.trim() !== '' && billData.products.length > 0

  const handleCreateBill = async () => {
    if (!canCreate) return
    setCreating(true)
    setCreateError(null)

    try {
      const result = await createBill(billData)
      setPreviewBill(result)
      setBillData({ shopName: '', gst: false, customerGstNumber: '', skipStockCheck: false, products: [] })
    } catch (error) {
      setCreateError(error.message || 'Failed to create bill. Check if backend is running.')
      console.error('Error creating bill:', error)
    } finally {
      setCreating(false)
    }
  }

  const loadBills = async (filter) => {
    setBillsFilter(filter)
    setBillsLoading(true)
    setBillsError(null)
    try {
      let data
      if (filter === 'today') data = await getTodayBills()
      else if (filter === 'week') data = await getWeekBills()
      else if (filter === 'month') data = await getMonthBills()
      setBills(data)
    } catch (err) {
      setBillsError(err.message)
    } finally {
      setBillsLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'history' && bills === null) loadBills('today')
  }

  const subtotal = calculateSubtotal()
  const selectedStock = getSelectedStock()

  const missingItems = []
  if (!billData.shopName.trim()) missingItems.push('shop name')
  if (billData.products.length === 0) missingItems.push('at least one product')

  return (
    <div className="billing">
      <h2>Billing</h2>

      <div className="billing-tabs">
        <button
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => handleTabChange('create')}
        >
          Create Bill
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => handleTabChange('history')}
        >
          Bill History
        </button>
      </div>

      {activeTab === 'create' && (
        <div className="billing-layout">
          <div className="bill-form">
            <Card title="Bill Details">
              <div className={`form-group ${!billData.shopName.trim() && billData.products.length > 0 ? 'field-required' : ''}`}>
                <label>Shop Name</label>
                <input
                  type="text"
                  value={billData.shopName}
                  onChange={(e) => setBillData({ ...billData, shopName: e.target.value })}
                  placeholder="Enter shop name"
                />
                {!billData.shopName.trim() && billData.products.length > 0 && (
                  <span className="field-hint">Required to create bill</span>
                )}
              </div>

              <div className="gst-options">
                <label>
                  <input
                    type="checkbox"
                    checked={billData.gst}
                    onChange={(e) => setBillData({ ...billData, gst: e.target.checked })}
                  />
                  &nbsp;Apply GST
                </label>
              </div>

              {billData.gst && (
                <div className="form-group">
                  <label>Customer GST Number (optional)</label>
                  <input
                    type="text"
                    value={billData.customerGstNumber}
                    onChange={(e) => setBillData({ ...billData, customerGstNumber: e.target.value })}
                    placeholder="e.g. 27AAPFU0939F1ZV"
                  />
                </div>
              )}

              <div className="gst-options" style={{ marginTop: '8px' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={billData.skipStockCheck}
                    onChange={(e) => setBillData({ ...billData, skipStockCheck: e.target.checked })}
                  />
                  &nbsp;Skip stock deduction
                </label>
              </div>
            </Card>

            <Card title="Add Products">
              <div className="add-product-section">
                <div className="product-selector">
                  <select
                    value={selectedProductKey}
                    onChange={(e) => {
                      setSelectedProductKey(e.target.value)
                      const s = stockData?.find((p) => getProductKey(p) === e.target.value)
                      if (s) {
                        setMrp(String(s.mrp ?? s.sellingPrice ?? s.price ?? ''))
                        setSellingPrice(String(s.sellingPrice ?? s.mrp ?? s.price ?? ''))
                      }
                    }}
                  >
                    <option value="">Select Product</option>
                    {stockData?.map((product) => (
                      <option key={getProductKey(product)} value={getProductKey(product)}>
                        {product.name} — {formatPrice(product.sellingPrice ?? product.price)} (Stock: {product.quantity})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStock && (
                  <div className="product-inputs">
                    <div className="form-group">
                      <label>MRP (₹)</label>
                      <input
                        type="number"
                        value={mrp}
                        onChange={(e) => setMrp(e.target.value)}
                        step="0.01"
                        min="0.01"
                        placeholder="MRP"
                      />
                    </div>
                    <div className="form-group">
                      <label>Selling Price (₹)</label>
                      <input
                        type="number"
                        value={sellingPrice}
                        onChange={(e) => setSellingPrice(e.target.value)}
                        step="0.01"
                        min="0.01"
                        placeholder="Optional, defaults to MRP"
                      />
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                      />
                    </div>
                    <button onClick={addProductToBill} className="btn btn-primary">
                      Add to Bill
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="bill-preview">
            <Card title="Bill Preview">
              <div className="bill-header">
                <h3>Khurana Enterprise</h3>
                <p>{billData.shopName || <em>Shop Name</em>}</p>
                {billData.gst && <span className="gst-badge">GST Applied</span>}
              </div>

              <div className="products-list">
                {billData.products.length === 0 ? (
                  <p>No products added</p>
                ) : (
                  billData.products.map((product, idx) => (
                    <div key={idx} className="bill-product">
                      <div className="product-info">
                        <span>{product.productName}</span>
                        <span>
                          {product.qty} × {formatPrice(product.mrp)}
                          <small style={{ marginLeft: '4px', color: '#888' }}>
                            (selling: {formatPrice(product.price)})
                          </small>
                        </span>
                      </div>
                      <div className="product-actions">
                        <span>{formatPrice(product.mrp * product.qty)}</span>
                        <button
                          onClick={() => removeProduct(idx)}
                          className="btn-remove"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="bill-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {billData.gst && (
                  <div className="total-row">
                    <span>GST:</span>
                    <span>As per product GST rate</span>
                  </div>
                )}
                <div className="total-row final-total">
                  <span>Total (before GST):</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              {createError && (
                <div className="create-error">{createError}</div>
              )}

              {missingItems.length > 0 && (
                <div className="create-hint">Enter {missingItems.join(' and ')} to create bill</div>
              )}

              <button
                onClick={handleCreateBill}
                className={`btn create-bill-btn ${canCreate ? 'btn-success' : 'btn-disabled'}`}
                disabled={!canCreate || creating}
              >
                {creating ? 'Creating...' : 'Create Bill'}
              </button>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bill-history">
          <div className="history-controls">
            {['today', 'week', 'month'].map((f) => (
              <button
                key={f}
                className={`btn ${billsFilter === f ? 'btn-primary' : ''}`}
                onClick={() => loadBills(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {billsLoading && <div className="loading">Loading bills...</div>}
          {billsError && <div className="error">Error: {billsError}</div>}

          {!billsLoading && !billsError && bills && (
            bills.length === 0 ? (
              <div className="no-data">No bills found for this period</div>
            ) : (
              <div className="bills-list">
                {bills.map((bill) => (
                  <div key={bill.id} className="bill-history-card" onClick={() => setPreviewBill(bill)}>
                    <Card title={`Bill #${bill.id} — ${bill.shopName}`}>
                      <div className="bill-history-row">
                        <span>{formatDate(bill.billDate)}</span>
                        <span>{bill.gstApplied ? 'GST' : 'No GST'}</span>
                        <span className="bill-history-amount">{formatPrice(bill.totalAmount)}</span>
                      </div>
                      <div className="bill-history-products">
                        {(bill.products || []).length} product(s)
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      )}

      {/* Invoice preview modal */}
      {previewBill && (
        <BillInvoice bill={previewBill} onClose={() => setPreviewBill(null)} />
      )}
    </div>
  )
}

export default Billing