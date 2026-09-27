// Stock API calls — backend at /stock (proxied to http://localhost:8087)

const handleResponse = async (response) => {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const getAllStock = async () => {
  return handleResponse(await fetch('/stock'))
}

export const getStockByName = async (name) => {
  return handleResponse(await fetch(`/stock/${encodeURIComponent(name)}`))
}

export const addProduct = async (productData) => {
  const response = await fetch('/stock/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  })
  return handleResponse(response)
}

// Updates quantity by adding qty to existing stock
export const updateStockQty = async (name, price, qty) => {
  const response = await fetch(`/stock/${encodeURIComponent(name)}/${price}/${qty}`, {
    method: 'PUT',
  })
  return handleResponse(response)
}

export const updateGstRate = async (name, price, gstRate) => {
  const response = await fetch(`/stock/gst/${encodeURIComponent(name)}/${price}/${gstRate}`, {
    method: 'PUT',
  })
  return handleResponse(response)
}