import { useState } from 'react'
import Card from '../components/Card'
import { formatPrice, formatDate } from '../helpers/formatters'
import {
  getSalesByDay, getSalesByWeek, getSalesByMonth,
  getDailySummary, getWeeklySummary, getMonthlySummary,
} from '../services/salesService'
import './Sales.css'

function Sales() {
  const [viewType, setViewType] = useState('day')
  const [displayMode, setDisplayMode] = useState('list') // 'list' | 'summary'
  const [salesData, setSalesData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadSales = async (type, mode) => {
    setLoading(true)
    setError(null)
    try {
      let data
      if (mode === 'summary') {
        if (type === 'day') data = await getDailySummary()
        else if (type === 'week') data = await getWeeklySummary()
        else data = await getMonthlySummary()
      } else {
        if (type === 'day') data = await getSalesByDay()
        else if (type === 'week') data = await getSalesByWeek()
        else data = await getSalesByMonth()
      }
      setSalesData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleViewChange = (type) => {
    setViewType(type)
    loadSales(type, displayMode)
  }

  const handleModeChange = (mode) => {
    setDisplayMode(mode)
    loadSales(viewType, mode)
  }

  const calculateTotalRevenue = () =>
    (salesData || []).reduce((sum, s) => sum + (s.totalAmount || 0), 0)

  const calculateTotalQty = () =>
    (salesData || []).reduce((sum, s) => sum + (s.totalQuantity || s.quantity || 0), 0)

  return (
    <div className="sales">
      <div className="sales-header">
        <h2>Sales Reports</h2>
        <div className="view-controls">
          <div className="btn-group">
            {['day', 'week', 'month'].map((t) => (
              <button
                key={t}
                className={`btn ${viewType === t ? 'btn-primary' : ''}`}
                onClick={() => handleViewChange(t)}
              >
                {t === 'day' ? 'Daily' : t === 'week' ? 'Weekly' : 'Monthly'}
              </button>
            ))}
          </div>
          <div className="btn-group" style={{ marginLeft: '12px' }}>
            <button
              className={`btn ${displayMode === 'list' ? 'btn-primary' : ''}`}
              onClick={() => handleModeChange('list')}
            >
              All Sales
            </button>
            <button
              className={`btn ${displayMode === 'summary' ? 'btn-primary' : ''}`}
              onClick={() => handleModeChange('summary')}
            >
              Summary
            </button>
          </div>
        </div>
      </div>

      {salesData && (
        <div className="sales-stats">
          <Card title="Sales Overview">
            <div className="stats-grid">
              <div className="stat-item">
                <h3>{salesData.length}</h3>
                <p>{displayMode === 'summary' ? 'Products' : 'Records'}</p>
              </div>
              <div className="stat-item">
                <h3>{formatPrice(calculateTotalRevenue())}</h3>
                <p>Total Revenue</p>
              </div>
              <div className="stat-item">
                <h3>{calculateTotalQty()}</h3>
                <p>Total Quantity</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card title={`${viewType === 'day' ? 'Daily' : viewType === 'week' ? 'Weekly' : 'Monthly'} ${displayMode === 'summary' ? 'Summary' : 'Sales'}`}>
        {!salesData && !loading && !error && (
          <div className="no-data">
            <p>Select a period above to load sales data</p>
          </div>
        )}

        {loading && <div className="loading">Loading sales data...</div>}
        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && salesData && (
          <div className="sales-content">
            {salesData.length === 0 ? (
              <div className="no-data">
                <p>No sales data found for this period</p>
              </div>
            ) : displayMode === 'list' ? (
              <div className="sales-table">
                <div className="table-header">
                  <span>Date</span>
                  <span>Shop</span>
                  <span>Product</span>
                  <span>Qty</span>
                  <span>Price</span>
                  <span>MRP</span>
                  <span>Amount</span>
                </div>
                {salesData.map((sale) => (
                  <div key={sale.id} className="table-row">
                    <span>{formatDate(sale.saleDate)}</span>
                    <span>{sale.shopName || 'N/A'}</span>
                    <span>{sale.productName}</span>
                    <span>{sale.quantity}</span>
                    <span>{formatPrice(sale.price)}</span>
                    <span>{formatPrice(sale.mrp)}</span>
                    <span>{formatPrice(sale.totalAmount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sales-table">
                <div className="table-header">
                  <span>Date</span>
                  <span>Shop</span>
                  <span>Product</span>
                  <span>Price</span>
                  <span>Total Qty</span>
                  <span>Total Amount</span>
                </div>
                {salesData.map((summary, idx) => (
                  <div key={idx} className="table-row">
                    <span>{summary.saleDate || 'N/A'}</span>
                    <span>{summary.shopName || 'N/A'}</span>
                    <span>{summary.productName}</span>
                    <span>{formatPrice(summary.price)}</span>
                    <span>{summary.totalQuantity}</span>
                    <span>{formatPrice(summary.totalAmount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}

export default Sales