import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

interface CategoryForm {
  label: string
  question: string
  metricKey: string
  color: string
  unit: string
  formatPattern: string
  sortOrder: number
}

const emptyForm: CategoryForm = {
  label: '',
  question: '',
  metricKey: '',
  color: '#ffffff',
  unit: '',
  formatPattern: '',
  sortOrder: 0,
}

export function AdminCategories() {
  const categories = useQuery(api.categories.listAll)
  const createCategory = useMutation(api.categoryMutations.create)
  const updateCategory = useMutation(api.categoryMutations.update)

  const [expandedId, setExpandedId] = useState<Id<'categories'> | null>(null)
  const [editForm, setEditForm] = useState<{
    label: string
    question: string
    color: string
    formatPattern: string
    sortOrder: number
  } | null>(null)
  const [newForm, setNewForm] = useState<CategoryForm>(emptyForm)
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const sorted = categories
    ? [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
    : null

  function handleExpand(cat: NonNullable<typeof categories>[number]) {
    if (expandedId === cat._id) {
      setExpandedId(null)
      setEditForm(null)
    } else {
      setExpandedId(cat._id)
      setEditForm({
        label: cat.label,
        question: cat.question,
        color: cat.color,
        formatPattern: cat.formatPattern,
        sortOrder: cat.sortOrder,
      })
    }
  }

  async function handleToggleEnabled(
    id: Id<'categories'>,
    currentEnabled: boolean,
  ) {
    await updateCategory({ id, enabled: !currentEnabled })
  }

  async function handleSaveEdit() {
    if (!expandedId || !editForm) return
    setSaving(true)
    try {
      await updateCategory({
        id: expandedId,
        label: editForm.label,
        question: editForm.question,
        color: editForm.color,
        formatPattern: editForm.formatPattern,
        sortOrder: editForm.sortOrder,
      })
      setExpandedId(null)
      setEditForm(null)
    } finally {
      setSaving(false)
    }
  }

  async function handleCreate() {
    setSaving(true)
    try {
      await createCategory({
        label: newForm.label,
        question: newForm.question,
        metricKey: newForm.metricKey,
        color: newForm.color,
        unit: newForm.unit,
        formatPattern: newForm.formatPattern,
        sortOrder: newForm.sortOrder,
      })
      setNewForm(emptyForm)
      setShowAddForm(false)
    } finally {
      setSaving(false)
    }
  }

  if (!sorted) {
    return (
      <div className="text-white/40 text-sm">Loading categories...</div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="px-4 py-2 rounded-md text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          {showAddForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <div className="mb-6 rounded-lg border border-white/10 bg-neutral-900 p-5">
          <h2 className="text-lg font-semibold text-white mb-4">
            New Category
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Label"
              value={newForm.label}
              onChange={(v) => setNewForm((f) => ({ ...f, label: v }))}
            />
            <Field
              label="Metric Key"
              value={newForm.metricKey}
              onChange={(v) => setNewForm((f) => ({ ...f, metricKey: v }))}
            />
            <Field
              label="Question"
              value={newForm.question}
              onChange={(v) => setNewForm((f) => ({ ...f, question: v }))}
              className="col-span-2"
            />
            <Field
              label="Color (hex)"
              value={newForm.color}
              onChange={(v) => setNewForm((f) => ({ ...f, color: v }))}
            />
            <Field
              label="Unit"
              value={newForm.unit}
              onChange={(v) => setNewForm((f) => ({ ...f, unit: v }))}
            />
            <Field
              label="Format Pattern"
              value={newForm.formatPattern}
              onChange={(v) =>
                setNewForm((f) => ({ ...f, formatPattern: v }))
              }
            />
            <NumberField
              label="Sort Order"
              value={newForm.sortOrder}
              onChange={(v) => setNewForm((f) => ({ ...f, sortOrder: v }))}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => void handleCreate()}
              disabled={
                saving ||
                !newForm.label ||
                !newForm.metricKey ||
                !newForm.question
              }
              className="px-4 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Creating...' : 'Create Category'}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false)
                setNewForm(emptyForm)
              }}
              className="px-4 py-2 rounded-md text-sm font-medium bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="rounded-lg border border-white/10 bg-neutral-900 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_80px_80px] gap-4 px-5 py-3 text-xs font-medium text-white/40 uppercase tracking-wider border-b border-white/10 bg-neutral-900/80">
          <div className="w-4" />
          <div>Label</div>
          <div>Question</div>
          <div>Metric Key</div>
          <div>Format</div>
          <div className="text-center">Order</div>
          <div className="text-center">Enabled</div>
        </div>

        {sorted.length === 0 && (
          <div className="px-5 py-8 text-center text-white/30 text-sm">
            No categories yet. Add one above.
          </div>
        )}

        {sorted.map((cat) => (
          <div key={cat._id} className="border-b border-white/5 last:border-b-0">
            {/* Row */}
            <div
              className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_80px_80px] gap-4 px-5 py-3 items-center hover:bg-white/[0.02] transition-colors cursor-pointer"
              onClick={() => handleExpand(cat)}
            >
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <div className="text-sm text-white truncate">{cat.label}</div>
              <div className="text-sm text-white/60 truncate">
                {cat.question}
              </div>
              <div className="text-sm text-white/40 font-mono truncate">
                {cat.metricKey}
              </div>
              <div className="text-sm text-white/40 font-mono truncate">
                {cat.formatPattern}
              </div>
              <div className="text-sm text-white/40 text-center">
                {cat.sortOrder}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    void handleToggleEnabled(cat._id, cat.enabled)
                  }}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    cat.enabled ? 'bg-green-600' : 'bg-white/10'
                  }`}
                  title={cat.enabled ? 'Disable' : 'Enable'}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                      cat.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Expanded Edit Form */}
            {expandedId === cat._id && editForm && (
              <div className="px-5 pb-4 pt-1 bg-neutral-950/50 border-t border-white/5">
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Field
                    label="Label"
                    value={editForm.label}
                    onChange={(v) =>
                      setEditForm((f) => (f ? { ...f, label: v } : f))
                    }
                  />
                  <Field
                    label="Question"
                    value={editForm.question}
                    onChange={(v) =>
                      setEditForm((f) => (f ? { ...f, question: v } : f))
                    }
                  />
                  <Field
                    label="Color (hex)"
                    value={editForm.color}
                    onChange={(v) =>
                      setEditForm((f) => (f ? { ...f, color: v } : f))
                    }
                  />
                  <Field
                    label="Format Pattern"
                    value={editForm.formatPattern}
                    onChange={(v) =>
                      setEditForm((f) =>
                        f ? { ...f, formatPattern: v } : f,
                      )
                    }
                  />
                  <NumberField
                    label="Sort Order"
                    value={editForm.sortOrder}
                    onChange={(v) =>
                      setEditForm((f) => (f ? { ...f, sortOrder: v } : f))
                    }
                  />
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => void handleSaveEdit()}
                    disabled={saving}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setExpandedId(null)
                      setEditForm(null)
                    }}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared input components                                           */
/* ------------------------------------------------------------------ */

function Field({
  label,
  value,
  onChange,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  className?: string
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="block text-xs font-medium text-white/40 mb-1">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
      />
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
  className,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  className?: string
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="block text-xs font-medium text-white/40 mb-1">
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-md border border-white/10 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
      />
    </label>
  )
}
