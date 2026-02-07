import { useState, useMemo } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

type TabStatus = 'open' | 'resolved' | 'dismissed'

const TABS: { label: string; status: TabStatus }[] = [
  { label: 'Open', status: 'open' },
  { label: 'Resolved', status: 'resolved' },
  { label: 'Dismissed', status: 'dismissed' },
]

const STATUS_COLORS: Record<TabStatus, string> = {
  open: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
  dismissed: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
}

interface FactInfo {
  itemName: string
  itemEmoji: string
  metricKey: string
  value: number
  unit: string
  source: string
  sourceUrl?: string
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Individual dispute card - uses its own query for duplicate count.
 */
function DisputeCard({
  dispute,
  factInfo,
  activeTab,
}: {
  dispute: {
    _id: Id<'disputes'>
    factId: Id<'facts'>
    reason?: string
    comment?: string
    status: string
    resolvedBy?: string
    resolution?: string
    createdAt: number
    resolvedAt?: number
  }
  factInfo: FactInfo | undefined
  activeTab: TabStatus
}) {
  const duplicateCount = useQuery(api.disputes.countByFact, {
    factId: dispute.factId,
  })

  const resolveMutation = useMutation(api.disputes.resolve)
  const dismissMutation = useMutation(api.disputes.dismiss)
  const updateFactMutation = useMutation(api.itemMutations.updateFact)

  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [editSource, setEditSource] = useState('')
  const [dismissing, setDismissing] = useState(false)
  const [dismissNote, setDismissNote] = useState('')
  const [resolving, setResolving] = useState(false)
  const [resolveNote, setResolveNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleStartEdit = () => {
    if (factInfo) {
      setEditValue(String(factInfo.value))
      setEditSource(factInfo.source)
    }
    setEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!factInfo) return
    setSaving(true)
    try {
      const newValue = parseFloat(editValue)
      if (isNaN(newValue)) {
        alert('Value must be a valid number')
        setSaving(false)
        return
      }
      await updateFactMutation({
        id: dispute.factId,
        value: newValue,
        source: editSource,
      })
      await resolveMutation({
        disputeId: dispute._id,
        resolution: `Fact updated: value=${newValue}, source="${editSource}"`,
        resolvedBy: 'admin',
      })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDismiss = async () => {
    setSaving(true)
    try {
      await dismissMutation({
        disputeId: dispute._id,
        resolution: dismissNote || undefined,
        resolvedBy: 'admin',
      })
      setDismissing(false)
      setDismissNote('')
    } finally {
      setSaving(false)
    }
  }

  const handleResolve = async () => {
    if (!resolveNote.trim()) {
      alert('Please provide a resolution note')
      return
    }
    setSaving(true)
    try {
      await resolveMutation({
        disputeId: dispute._id,
        resolution: resolveNote,
        resolvedBy: 'admin',
      })
      setResolving(false)
      setResolveNote('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-neutral-900 border border-white/10 rounded-lg p-5">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          {factInfo ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg">{factInfo.itemEmoji}</span>
              <span className="font-semibold text-white">
                {factInfo.itemName}
              </span>
              <span className="text-white/40">/</span>
              <span className="text-white/70 font-mono text-sm">
                {factInfo.metricKey}
              </span>
            </div>
          ) : (
            <span className="text-white/40 text-sm">
              Fact not found (ID: {dispute.factId})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {(duplicateCount ?? 0) > 1 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {duplicateCount} disputes
            </span>
          )}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[dispute.status as TabStatus]}`}
          >
            {dispute.status}
          </span>
        </div>
      </div>

      {/* Fact value */}
      {factInfo && !editing && (
        <div className="mb-3 text-sm text-white/60">
          Current value:{' '}
          <span className="text-white font-medium">
            {factInfo.value.toLocaleString()} {factInfo.unit}
          </span>
          <span className="text-white/30 ml-2">
            (source: {factInfo.source})
          </span>
        </div>
      )}

      {/* Dispute reason and comment */}
      {dispute.reason && (
        <div className="mb-2 text-sm">
          <span className="text-white/40">Reason: </span>
          <span className="text-white/80">{dispute.reason}</span>
        </div>
      )}
      {dispute.comment && (
        <div className="mb-2 text-sm">
          <span className="text-white/40">Comment: </span>
          <span className="text-white/80">{dispute.comment}</span>
        </div>
      )}

      {/* Timestamp */}
      <div className="text-xs text-white/30 mb-4">
        Submitted {formatTimestamp(dispute.createdAt)}
      </div>

      {/* Resolution info for resolved/dismissed */}
      {activeTab !== 'open' && (
        <div className="mb-4 p-3 bg-white/5 rounded border border-white/5">
          {dispute.resolution && (
            <div className="text-sm text-white/70 mb-1">
              <span className="text-white/40">Resolution: </span>
              {dispute.resolution}
            </div>
          )}
          {dispute.resolvedBy && (
            <div className="text-xs text-white/40">
              By {dispute.resolvedBy}
              {dispute.resolvedAt && (
                <> on {formatTimestamp(dispute.resolvedAt)}</>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions (only for open disputes) */}
      {activeTab === 'open' && (
        <div className="flex flex-col gap-3">
          {/* Inline edit form */}
          {editing && (
            <div className="p-3 bg-white/5 rounded border border-white/10">
              <div className="text-sm font-medium text-white/70 mb-2">
                Edit Fact
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/40 w-16 shrink-0">
                    Value
                  </label>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 bg-neutral-800 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/40 w-16 shrink-0">
                    Source
                  </label>
                  <input
                    type="text"
                    value={editSource}
                    onChange={(e) => setEditSource(e.target.value)}
                    className="flex-1 bg-neutral-800 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-white/30"
                  />
                </div>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded disabled:opacity-50 transition-colors"
                  >
                    {saving ? 'Saving...' : 'Save & Resolve'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-3 py-1 text-sm bg-neutral-700 hover:bg-neutral-600 text-white/70 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Dismiss form */}
          {dismissing && (
            <div className="p-3 bg-white/5 rounded border border-white/10">
              <div className="text-sm font-medium text-white/70 mb-2">
                Dismiss Dispute
              </div>
              <input
                type="text"
                value={dismissNote}
                onChange={(e) => setDismissNote(e.target.value)}
                placeholder="Optional note..."
                className="w-full bg-neutral-800 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-white/30 mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDismiss}
                  disabled={saving}
                  className="px-3 py-1 text-sm bg-neutral-600 hover:bg-neutral-500 text-white rounded disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Dismissing...' : 'Confirm Dismiss'}
                </button>
                <button
                  onClick={() => setDismissing(false)}
                  className="px-3 py-1 text-sm bg-neutral-700 hover:bg-neutral-600 text-white/70 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Resolve form */}
          {resolving && (
            <div className="p-3 bg-white/5 rounded border border-white/10">
              <div className="text-sm font-medium text-white/70 mb-2">
                Resolve Dispute
              </div>
              <input
                type="text"
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="Resolution note (required)..."
                className="w-full bg-neutral-800 border border-white/10 rounded px-2 py-1 text-sm text-white outline-none focus:border-white/30 mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleResolve}
                  disabled={saving}
                  className="px-3 py-1 text-sm bg-green-600 hover:bg-green-500 text-white rounded disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Resolving...' : 'Confirm Resolve'}
                </button>
                <button
                  onClick={() => setResolving(false)}
                  className="px-3 py-1 text-sm bg-neutral-700 hover:bg-neutral-600 text-white/70 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!editing && !dismissing && !resolving && (
            <div className="flex gap-2">
              <button
                onClick={handleStartEdit}
                className="px-3 py-1.5 text-sm bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded transition-colors"
              >
                Edit Fact
              </button>
              <button
                onClick={() => setDismissing(true)}
                className="px-3 py-1.5 text-sm bg-neutral-600/20 hover:bg-neutral-600/30 text-neutral-400 border border-neutral-500/30 rounded transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => setResolving(true)}
                className="px-3 py-1.5 text-sm bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30 rounded transition-colors"
              >
                Resolve
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function AdminDisputes() {
  const [activeTab, setActiveTab] = useState<TabStatus>('open')

  const disputes = useQuery(api.disputes.list, { status: activeTab })
  const allItems = useQuery(api.items.listAll)

  // Build a lookup map: factId -> { itemName, metricKey, value, unit, source }
  const factLookup = useMemo(() => {
    if (!allItems) return new Map<string, FactInfo>()
    const map = new Map<string, FactInfo>()
    for (const item of allItems) {
      for (const fact of item.facts) {
        map.set(fact._id, {
          itemName: item.name,
          itemEmoji: item.emoji,
          metricKey: fact.metricKey,
          value: fact.value,
          unit: fact.unit,
          source: fact.source,
          sourceUrl: fact.sourceUrl,
        })
      }
    }
    return map
  }, [allItems])

  const isLoading = disputes === undefined || allItems === undefined

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Disputes</h1>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-neutral-900 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.status}
            onClick={() => setActiveTab(tab.status)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.status
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <p className="text-white/40 text-sm">Loading disputes...</p>
      ) : disputes.length === 0 ? (
        <div className="bg-neutral-900 border border-white/10 rounded-lg p-8 text-center">
          <p className="text-white/40">
            No {activeTab} disputes found.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {disputes.map((dispute) => (
            <DisputeCard
              key={dispute._id}
              dispute={dispute}
              factInfo={factLookup.get(dispute.factId)}
              activeTab={activeTab}
            />
          ))}
        </div>
      )}
    </div>
  )
}
