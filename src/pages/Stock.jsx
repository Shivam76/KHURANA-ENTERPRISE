import { useState } from 'react'
import Card from '../components/Card'
import useFetch from '../hooks/useFetch'
import { addProduct, updateStockQty, updateGstRate } from '../services/stockService'
import { formatPrice } from '../helpers/formatters'
import './Stock.css'

function Stock() {
  const { data: stockData, loading, error, refetch } = useFetch('/stock')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingGst, setEditingGst] = useState(null) // { name, price }
  const [newGstRate, setNewGstRate] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    sellingPrice: '',
    mrp: '',
    loosePcs: '',
    box: '',
    pcsPerBox: '',
    hsnCode: '',
    cgstRate: '',
    sgstRate: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addProduct({
        name: formData.name,
        sellingPrice: formData.sellingPrice ? parseFloat(formData.sellingPrice) : 0,
        mrp: formData.mrp ? parseFloat(formData.mrp) : 0,
        loosePcs: formData.loosePcs ? parseInt(formData.loosePcs) : 0,
        box: formData.box ? parseInt(formData.box) : 0,
        pcsPerBox: formData.pcsPerBox ? parseInt(formData.pcsPerBox) : 0,
        hsnCode: formData.hsnCode ? parseInt(formData.hsnCode) : 0,
        cgstRate: formData.cgstRate ? parseFloat(formData.cgstRate) : 0,
        sgstRate: formData.sgstRate ? parseFloat(formData.sgstRate) : 0,
      })
      setFormData({ name: '', sellingPrice: '', mrp: '', loosePcs: '', box: '', pcsPerBox: '', hsnCode: '', cgstRate: '', sgstRate: '' })
      setShowAddForm(false)
      refetch()
    } catch (error) {
      alert('Error adding product: ' + error.message)
      console.error('Error adding product:', error)
    }
  }

  const handleAddQty = async (product, qtyToAdd) => {
    try {
      const keyPrice = product.mrp ?? product.sellingPrice ?? product.price ?? 0
      await updateStockQty(product.name, keyPrice, qtyToAdd)
      refetch()
    } catch (error) {
      alert('Error updating stock: ' + error.message)
      console.error('Error updating stock:', error)
    }
  }

  const handleSaveGst = async (product) => {
    if (!newGstRate) return
    try {
      const keyPrice = product.mrp ?? product.sellingPrice ?? product.price ?? 0
      await updateGstRate(product.name, keyPrice, parseFloat(newGstRate))
      setEditingGst(null)
      setNewGstRate('')
      refetch()
    } catch (error) {
      alert('Error updating GST rate: ' + error.message)
    }
  }

  if (loading) return <div className="loading">Loading stock data...</div>
  if (error) return <div className="error">Error: {error.message}</div>

  return (
    <div className="stock">
      <div className="stock-header">
        <h2>Stock Management</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {showAddForm && (
        <Card title="Add New Product">
          <form onSubmit={handleSubmit} className="add-product-form">
            <div className="form-row">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Selling Price (₹)</label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>MRP (₹)</label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleInputChange}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Loose Pieces</label>
                <input
                  type="number"
                  name="loosePcs"
                  value={formData.loosePcs}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Boxes</label>
                <input
                  type="number"
                  name="box"
                  value={formData.box}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Pcs per Box</label>
                <input
                  type="number"
                  name="pcsPerBox"
                  value={formData.pcsPerBox}
                  onChange={handleInputChange}
                  min="0"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>HSN Code</label>
                <input
                  type="number"
                  name="hsnCode"
                  value={formData.hsnCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>CGST Rate (%)</label>
                <input
                  type="number"
                  name="cgstRate"
                  value={formData.cgstRate}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>SGST Rate (%)</label>
                <input
                  type="number"
                  name="sgstRate"
                  value={formData.sgstRate}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success">Add Product</button>
          </form>
        </Card>
      )}

      <div className="stock-grid">
        {stockData?.map((product) => (
          <Card key={product.id} title={product.name}>
            <div className="product-details">
              <p><strong>Selling Price:</strong> {formatPrice(product.sellingPrice ?? product.price)}</p>
              <p><strong>MRP:</strong> {formatPrice(product.mrp ?? product.sellingPrice ?? product.price)}</p>
              <p><strong>Total Qty:</strong> {product.quantity}</p>
              <p><strong>Boxes:</strong> {product.box} | <strong>Loose Pcs:</strong> {product.loosePcs ?? 0}</p>
              {product.pcsPerBox > 0 && <p><strong>Pcs/Box:</strong> {product.pcsPerBox}</p>}
              {product.hsnCode > 0 && <p><strong>HSN Code:</strong> {product.hsnCode}</p>}
              <p>
                <strong>GST:</strong>{' '}
                {product.cgstRate ?? product.gstRate ?? 0}% CGST / {product.sgstRate ?? product.gstRate ?? 0}% SGST
              </p>
              <div className="product-actions">
                <button
                  className="btn btn-sm"
                  onClick={() => handleAddQty(product, 1)}
                >
                  +1 Piece
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => handleAddQty(product, product.pcsPerBox || 1)}
                >
                  +1 Box
                </button>
              </div>
            </div>
          </Card>
        )) || <p>No products found</p>}
      </div>
    </div>
  )
}

export default Stock