'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react'

const schema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})
type FormData = z.infer<typeof schema>

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast.error('Invalid or missing reset token')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: data.password }),
      })
      
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to reset password')
      
      setSuccess(true)
      toast.success('Password updated successfully')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="glass rounded-3xl p-8 border border-border/50 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-black mb-3 font-display">
          Password Reset!
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>
        <Link href="/login" className="inline-block w-full text-center py-2.5 rounded-xl btn-glow font-semibold text-primary-foreground gradient-bg-primary text-primary-foreground">
          Continue to Sign In
        </Link>
      </div>
    )
  }

  if (!token) {
    return (
      <div className="glass rounded-3xl p-8 border border-border/50 text-center">
        <h1 className="text-2xl font-black mb-3 text-destructive">
          Invalid Link
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password" className="text-primary font-medium hover:underline flex items-center justify-center gap-2">
           Request New Link
        </Link>
      </div>
    )
  }

  return (
    <div className="glass rounded-3xl p-8 border border-border/50">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black mb-2 font-display">
          New Password
        </h1>
        <p className="text-muted-foreground text-sm">Create a new, strong password</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 pr-10 h-11 glass border-border/50 focus:border-primary/50"
              {...register('password')}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className="pl-10 h-11 glass border-border/50 focus:border-primary/50"
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-xl btn-glow font-semibold gradient-bg-primary text-primary-foreground"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Updating...
            </span>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="glass rounded-3xl p-8 border border-border/50 text-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
