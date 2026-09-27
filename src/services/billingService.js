// Billing API calls — backend at /bill (proxied to http://localhost:8087)

const handleResponse = async (response) => {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const createBill = async ({ shopName, gst, customerGstNumber = '', skipStockCheck = false, products }) => {
  const params = new URLSearchParams({ shopName, gst: String(gst) })
  if (customerGstNumber) params.append('customerGstNumber', customerGstNumber)
  if (skipStockCheck) params.append('skipStockCheck', 'true')

  const normalizedProducts = (products || []).map((p) => ({
    productName: p.productName,
    sellingPrice: Number(p.sellingPrice || p.price || p.mrp || 0),
    mrp: Number(p.mrp || p.price || p.sellingPrice || 0),
    qty: Number(p.qty ?? p.quantity ?? 1),
  }))

  const response = await fetch(`/bill?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      products: normalizedProducts,
      prodcuts: normalizedProducts,
    }),
  })
  return handleResponse(response)
}

export const getTodayBills = async () => {
  return handleResponse(await fetch('/bill/today'))
}

export const getYesterdayBills = async () => {
  return handleResponse(await fetch('/bill/yesterday'))
}

export const getWeekBills = async () => {
  return handleResponse(await fetch('/bill/week'))
}

export const getMonthBills = async () => {
  return handleResponse(await fetch('/bill/month'))
}

export const getBillsByMonthYear = async (month, year) => {
  return handleResponse(await fetch(`/bill/month/${month}/year/${year}`))
}

export const getBillsByYear = async (year) => {
  return handleResponse(await fetch(`/bill/year/${year}`))
}

export const getBillsByShop = async (shopName) => {
  return handleResponse(await fetch(`/bill/shop/${encodeURIComponent(shopName)}`))
}