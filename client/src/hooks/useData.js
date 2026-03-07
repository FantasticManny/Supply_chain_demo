import { useQuery } from '@tanstack/react-query'
import api from '../utils/api'

export function usePriceSummary() {
  return useQuery({
    queryKey: ['price-summary'],
    queryFn: async () => {
      const { data } = await api.get('/prices/summary')
      return data.data || []
    },
    staleTime: 10 * 60 * 1000
  })
}

export function usePriceHistory(itemId, locationId, days = 60) {
  return useQuery({
    queryKey: ['price-history', itemId, locationId, days],
    queryFn: async () => {
      if (!itemId) return null
      const params = {}
      if (locationId) params.location_id = locationId
      params.days = days
      const { data } = await api.get(`/prices/${itemId}`, { params })
      return data
    },
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000
  })
}

export function useStateComparison(itemId) {
  return useQuery({
    queryKey: ['state-comparison', itemId],
    queryFn: async () => {
      const { data } = await api.get(`/prices/market/state-comparison/${itemId}`)
      return data.data || []
    },
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000
  })
}

export function useItems(categoryId) {
  return useQuery({
    queryKey: ['items', categoryId],
    queryFn: async () => {
      const params = categoryId ? { category_id: categoryId } : {}
      const { data } = await api.get('/items', { params })
      return data.data || []
    },
    staleTime: 30 * 60 * 1000
  })
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/items/categories')
      return data.data || []
    },
    staleTime: 60 * 60 * 1000
  })
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await api.get('/items/locations')
      return data.data || []
    },
    staleTime: 60 * 60 * 1000
  })
}

export function useReports(status = 'verified', category) {
  return useQuery({
    queryKey: ['reports', status, category],
    queryFn: async () => {
      const params = { status, limit: 50 }
      if (category) params.category = category
      const { data } = await api.get('/reports', { params })
      return data.data || []
    },
    staleTime: 5 * 60 * 1000
  })
}

export function useAllReports() {
  return useQuery({
    queryKey: ['reports-all'],
    queryFn: async () => {
      const { data } = await api.get('/reports/all')
      return data.data || []
    },
    staleTime: 2 * 60 * 1000
  })
}

export function useMyReports() {
  return useQuery({
    queryKey: ['reports-mine'],
    queryFn: async () => {
      const { data } = await api.get('/reports/mine')
      return data.data || []
    },
    staleTime: 2 * 60 * 1000
  })
}
