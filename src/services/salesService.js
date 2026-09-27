// Sales API calls — backend at /sales (proxied to http://localhost:8087)

const handleResponse = async (response) => {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `HTTP error! status: ${response.status}`)
  }
  return response.json()
}

export const getSalesByDay = async () => {
  return handleResponse(await fetch('/sales/day'))
}

export const getSalesByWeek = async () => {
  return handleResponse(await fetch('/sales/week'))
}

export const getSalesByMonth = async () => {
  return handleResponse(await fetch('/sales/month'))
}

export const getDailySummary = async () => {
  return handleResponse(await fetch('/sales/summary/day'))
}

export const getWeeklySummary = async () => {
  return handleResponse(await fetch('/sales/summary/week'))
}

export const getMonthlySummary = async () => {
  return handleResponse(await fetch('/sales/summary/month'))
}