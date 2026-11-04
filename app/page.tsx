'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const { data, error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setMessage('Account created. Check your email to confirm it, then log in.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/me')
    const me = await res.json()
    router.push(me.role === 'admin' ? '/admin' : '/dashboard')
    router.refresh()
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f3f5f2] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-emerald-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full bg-amber-100/70 blur-3xl" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_30px_90px_-40px_rgba(20,40,30,0.28)] md:min-h-[620px] md:grid-cols-2">
        <section className="flex items-center px-7 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto w-full max-w-sm">
            <Link href="/" className="inline-flex items-center gap-3" aria-label="Taskflow home">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-lg font-bold text-white shadow-lg shadow-emerald-900/15">
                T
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900">Taskflow</span>
            </Link>

            <div className="mt-10">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Your workspace awaits
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {mode === 'login' ? 'Welcome back.' : 'Make room for progress.'}
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {mode === 'login'
                  ? 'Sign in and pick up right where you left off.'
                  : 'Create an account to bring your tasks together.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}
              {message && (
                <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-xl bg-emerald-800 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-slate-500">
              {mode === 'login' ? 'New to Taskflow?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login')
                  setError('')
                  setMessage('')
                }}
                className="font-semibold text-emerald-800 underline-offset-4 hover:underline"
              >
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </div>
        </section>

        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#173b32] p-10 text-white md:flex lg:p-14">
          <div className="absolute -right-24 -top-20 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-8 -top-4 h-48 w-48 rounded-full border border-white/10" />
          <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-emerald-700/30 blur-2xl" />
          <div className="relative">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium tracking-wide text-emerald-100">
              A calmer way to get things done
            </span>
          </div>
          <div className="relative">
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm font-medium text-emerald-50">Today&apos;s focus</span>
                <span className="text-xs text-emerald-200">3 of 5 complete</span>
              </div>
              <div className="mt-4 space-y-4">
                {[
                  { text: 'Plan the week ahead', done: true },
                  { text: 'Review project milestones', done: true },
                  { text: 'Share progress with the team', done: false },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3 text-sm">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${item.done ? 'border-emerald-300 bg-emerald-300 text-emerald-950' : 'border-white/30 text-transparent'}`}>
                      {item.done ? '✓' : ''}
                    </span>
                    <span className={item.done ? 'text-emerald-100/65 line-through' : 'text-white'}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <h2 className="text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
              Small steps.
              <br />
              Big momentum.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-emerald-100/75">
              Keep your priorities clear, stay on top of the details, and make progress you can see.
            </p>
          </div>
          <p className="relative text-xs text-emerald-100/50">A little more focus, every day.</p>
        </aside>
      </div>
    </main>
  )
}
