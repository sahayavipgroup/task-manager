'use client'

import type { Task, TaskStatus } from '@/types/task'

const badgeStyles: Record<TaskStatus, string> = {
  pending: 'bg-slate-100 text-slate-700 ring-slate-200',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-200',
  done: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

const labels: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  done: 'Done',
}

type Props = {
  task: Task
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  showOwner?: boolean
}

export default function TaskCard({ task, onStatusChange, onDelete, showOwner = false }: Props) {
  return (
    <article className="group flex flex-col gap-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-emerald-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`font-semibold ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
            {task.title}
          </h3>
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeStyles[task.status]}`}>
            {labels[task.status]}
          </span>
        </div>
        {task.description && (
          <p className="mt-2 text-sm leading-6 text-slate-600">{task.description}</p>
        )}
        <p className="mt-3 text-xs font-medium text-slate-400">
          {showOwner && task.profiles?.email && <>{task.profiles.email} <span className="px-1">·</span> </>}
          Added {new Date(task.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-slate-100 pt-4 sm:border-0 sm:pt-0">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          aria-label={`Change status for ${task.title}`}
          className="min-w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <button
          onClick={() => onDelete(task.id)}
          aria-label={`Delete ${task.title}`}
          className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/15"
        >
          Delete
        </button>
      </div>
    </article>
  )
}