import { useState, useEffect, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

const REASON_OPTIONS = ['Wrong value', 'Outdated', 'Bad source'] as const

type DisputeSheetProps = {
  factId: string
  itemName: string
  formattedValue: string
  onClose: () => void
}

const SESSION_KEY = 'dispute_count'
const MAX_DISPUTES_PER_SESSION = 3

function getDisputeCount(): number {
  return parseInt(sessionStorage.getItem(SESSION_KEY) ?? '0', 10)
}

function incrementDisputeCount(): void {
  sessionStorage.setItem(SESSION_KEY, String(getDisputeCount() + 1))
}

export function DisputeSheet({ factId, itemName, formattedValue, onClose }: DisputeSheetProps) {
  const submitDispute = useMutation(api.disputes.submit)

  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'duplicate' | 'rate_limited'>('idle')

  // Auto-close after success
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(onClose, 1500)
      return () => clearTimeout(timer)
    }
  }, [status, onClose])

  const handleSubmit = useCallback(async () => {
    if (status === 'submitting') return

    // Client-side rate limit
    if (getDisputeCount() >= MAX_DISPUTES_PER_SESSION) {
      setStatus('rate_limited')
      return
    }

    setStatus('submitting')

    try {
      const result = await submitDispute({
        factId: factId as Id<'facts'>,
        reason: selectedReason ?? undefined,
        comment: comment.trim() || undefined,
      })

      if (result.success) {
        incrementDisputeCount()
        setStatus('success')
      } else if (result.reason?.includes('already exists')) {
        setStatus('duplicate')
      } else {
        setStatus('idle')
      }
    } catch {
      setStatus('idle')
    }
  }, [factId, selectedReason, comment, status, submitDispute])

  const statusMessage =
    status === 'success' ? 'Flagged for review' :
    status === 'duplicate' ? 'Already flagged' :
    status === 'rate_limited' ? 'Flag limit reached' :
    null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      />

      {/* Sheet */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '420px',
          background: '#1a1a2e',
          borderRadius: '16px 16px 0 0',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: 'none',
          animation: 'slideUp 0.25s ease-out',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.4)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '6px',
            }}
          >
            Flag inaccurate fact
          </div>
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text)',
            }}
          >
            {itemName} — {formattedValue}
          </div>
        </div>

        {/* Status message */}
        {statusMessage && (
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              color: status === 'success' ? 'var(--correct)' :
                     status === 'duplicate' ? 'var(--cat-color)' :
                     'var(--wrong)',
              textAlign: 'center',
              padding: '12px 0',
            }}
          >
            {statusMessage}
          </div>
        )}

        {/* Form content (hidden during status messages) */}
        {!statusMessage && (
          <>
            {/* Reason chips */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.35)',
                  marginBottom: '8px',
                }}
              >
                Reason (optional)
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {REASON_OPTIONS.map((reason) => {
                  const isSelected = selectedReason === reason
                  return (
                    <button
                      key={reason}
                      onClick={() => setSelectedReason(isSelected ? null : reason)}
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '13px',
                        fontWeight: 500,
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: isSelected
                          ? '1px solid var(--cat-color)'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        background: isSelected
                          ? 'color-mix(in srgb, var(--cat-color) 15%, transparent)'
                          : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected
                          ? 'var(--cat-color)'
                          : 'rgba(255, 255, 255, 0.5)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {reason}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Comment field */}
            <div style={{ marginBottom: '20px' }}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What seems off?"
                rows={2}
                style={{
                  width: '100%',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: '14px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  color: 'var(--text)',
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
                }}
              />
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={status === 'submitting'}
              style={{
                width: '100%',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 0',
                borderRadius: '8px',
                border: 'none',
                background: 'color-mix(in srgb, var(--cat-color) 20%, transparent)',
                color: 'var(--cat-color)',
                cursor: status === 'submitting' ? 'wait' : 'pointer',
                opacity: status === 'submitting' ? 0.6 : 1,
                transition: 'all 0.15s ease',
              }}
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Flag'}
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
