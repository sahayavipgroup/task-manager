'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import TaskCard from '@/components/TaskCard'
import type { Task, TaskStatus } from '@/types/task'

export default function DashboardPage() {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/tasks')
      .then(async (res) => {
        const body = await res.json()
        if (!res.ok) throw new Error(body.error)
        setTasks(body)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })
    const body = await res.json()
    setSaving(false)

    if (!res.ok) return setError(body.error)
    setTasks((prev) => [body, ...prev])
    setTitle('')
    setDescription('')
  }

  async function handleStatusChange(id: string, status: TaskStatus) {
    setError('')
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const body = await res.json()
    if (!res.ok) return setError(body.error)
    setTasks((prev) => prev.map((t) => (t.id === id ? body : t)))
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this task?')) return
    setError('')
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json()
      return setError(body.error)
    }
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const count = (s: TaskStatus) => tasks.filter((t) => t.status === s).length
  const stats = [
    { label: 'Total tasks', value: tasks.length, tone: 'bg-slate-100 text-slate-700' },
    { label: 'To do', value: count('pending'), tone: 'bg-amber-50 text-amber-700' },
    { label: 'In progress', value: count('in_progress'), tone: 'bg-blue-50 text-blue-700' },
    { label: 'Completed', value: count('done'), tone: 'bg-emerald-50 text-emerald-700' },
  ]

  return (
    <main className="min-h-screen bg-[#f3f5f2]">
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-sm font-bold text-white">T</span>
            <div>
              <p className="font-bold tracking-tight text-slate-900">Taskflow</p>
              <p className="text-xs text-slate-500">Personal workspace</p>
            </div>
          </a>
          <button
            onClick={handleLogout}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            Log out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-8 px-5 py-9 sm:px-8 sm:py-12">
        <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-emerald-800">Your space to focus</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">My tasks</h1>
            <p className="mt-2 text-sm text-slate-500">Keep your day moving, one task at a time.</p>
          </div>
          <p className="rounded-full border border-emerald-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
            {count('done')} completed so far
          </p>
        </section>

        <section aria-label="Task summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
              <div className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${item.tone}`}>{item.label}</div>
              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{item.value}</p>
            </div>
          ))}
        </section>

        <form onSubmit={handleCreate} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">Add a task</h2>
            <p className="mt-1 text-sm text-slate-500">Get it out of your head and onto your list.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr_auto] sm:items-start">
            <input
              required
              aria-label="Task title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
            />
            <textarea
              aria-label="Task description"
              placeholder="Add a note (optional)"
              rows={1}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Adding...' : '+ Add task'}
            </button>
          </div>
        </form>

        {error && (
          <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-12 text-center text-sm text-slate-500 shadow-sm">Loading your tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-800">✓</span>
            <h2 className="mt-4 font-semibold text-slate-900">A fresh start</h2>
            <p className="mt-1 text-sm text-slate-500">Add your first task above and make today count.</p>
          </div>
        ) : (
          <section aria-label="Your tasks" className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-bold text-slate-900">Your list</h2>
              <span className="text-xs font-medium text-slate-500">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
            </div>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  )
}