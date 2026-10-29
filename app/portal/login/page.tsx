"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/useAuth'

export default function LoginPage() {
  const [controlNumber, setControlNumber] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login(controlNumber, password)
      router.replace('/portal')
    } catch (error) {
      // Login failed - show error
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 sm:p-10 max-w-md w-full shadow-2xl border border-neutral-200">
        <h2 className="text-2xl font-bold text-orange-600 text-center mb-6">
          Patient Portal Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Control Number */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Control Number
            </label>
            <Input
              value={controlNumber}
              onChange={(e) => setControlNumber(e.target.value)}
              placeholder="Enter your control number"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Logging in...' : 'Sign In'}
          </Button>

          {/* Divider */}
          <div className="text-center text-sm text-neutral-500 mt-4">
            <span>or</span>
          </div>

          {/* OTP Alternative */}
          <p className="text-center text-sm text-neutral-500 mt-3">
            Don't have an account? Contact admin for registration.
          </p>
        </form>
      </div>
    </div>
  )
}