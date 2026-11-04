'use client'

import type { Task, TaskStatus } from '@/types/task'

const badgeStyles: Record<TaskStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
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
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold text-gray-900">{task.title}</h3>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeStyles[task.status]}`}>
            {labels[task.status]}
          </span>
        </div>
        {task.description && (
          <p className="mt-1 text-sm text-gray-500">{task.description}</p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          {showOwner && task.profiles?.email && <>Owner: {task.profiles.email} · </>}
          {new Date(task.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <button
          onClick={() => onDelete(task.id)}
          className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
        >
          Delete
        </button>
      </div>
    </div>
  )
}