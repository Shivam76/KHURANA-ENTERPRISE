import { getApiUrl } from '../config/api'

// Stock API calls — backend at /stock

const handleResponse = async (response) => {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const getAllStock = async () => {
  return handleResponse(await fetch(getApiUrl('/stock')))
}

export const getStockByName = async (name) => {
  return handleResponse(await fetch(getApiUrl(`/stock/${encodeURIComponent(name)}`)))
}

export const addProduct = async (productData) => {
  const response = await fetch(getApiUrl('/stock/add'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  })
  return handleResponse(response)
}

// Updates quantity by adding qty to existing stock
export const updateStockQty = async (name, price, qty) => {
  const response = await fetch(getApiUrl(`/stock/${encodeURIComponent(name)}/${price}/${qty}`), {
    method: 'PUT',
  })
  return handleResponse(response)
}

export const updateGstRate = async (name, price, gstRate) => {
  const response = await fetch(getApiUrl(`/stock/gst/${encodeURIComponent(name)}/${price}/${gstRate}`), {
    method: 'PUT',
  })
  return handleResponse(response)
}