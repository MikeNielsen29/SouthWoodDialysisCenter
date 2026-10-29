"use client"

import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [inquiries, setInquiries] = useState<any[]>([])
  const [testimonials, setTestimonials] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setSession(data.session)
        }
      } catch {
        // No session
      }
    }
    checkSession()
  }, [])

  const login = async (controlNumber: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ controlNumber, password }),
    })
    if (res.ok) {
      const data = await res.json()
      setUser(data.user)
      setSession({ route: '/portal' })
    } else {
      throw new Error('Login failed')
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout')
    setUser(null)
    setSession(null)
  }

  const approveTestimonial = async (id: string) => {}
  const rejectTestimonial = async (id: string) => {}
  const deleteUser = async (id: string) => {}
  const toggleRole = async (id: string) => {}

  return {
    user,
    session,
    login,
    logout,
    isLoading,
    analyticsData,
    inquiries,
    testimonials,
    users,
    approveTestimonial,
    rejectTestimonial,
    deleteUser,
    toggleRole,
  }
}