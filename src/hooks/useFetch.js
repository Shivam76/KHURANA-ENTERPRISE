import { useState, useEffect } from 'react'

function useFetch(url, options = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1)
  }

  useEffect(() => {
    if (!url) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err)
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [url, refetchTrigger, ...(options.refetchTrigger || [])])

  return { data, loading, error, refetch }
}

export default useFetch