import { useState } from 'react'
import type { Anomaly } from '../../types'
import { useApp } from '../../context/AppContext'

interface Props {
  anomaly: Anomaly
}

type LocalStatus = 'idle' | 'sending' | 'sent' | 'rejected'

export default function ApprovalCard({ anomaly }: Props) {
  const { approveOutreach, rejectOutreach } = useApp()
  const [localStatus, setLocalStatus] = useState<LocalStatus>('idle')

  if (anomaly.outreach_status !== 'pending') {
    return (
      <div className="bg-card rounded-xl p-4 mb-4 border border-white/5">
        <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Outreach</div>
        <div className={`text-sm font-medium ${
          anomaly.outreach_status === 'sent' ? 'text-green-400' : 'text-slate-500'
        }`}>
          {anomaly.outreach_status === 'sent' ? '✓ Email sent' : '✗ Rejected'}
        </div>
      </div>
    )
  }

  if (localStatus === 'sent') {
    return (
      <div className="bg-card rounded-xl p-4 mb-4 border border-green-500/20">
        <div className="text-sm font-medium text-green-400">✓ Email approved and sent</div>
      </div>
    )
  }

  if (localStatus === 'rejected') {
    return (
      <div className="bg-card rounded-xl p-4 mb-4 border border-white/5">
        <div className="text-sm text-slate-500">✗ Outreach rejected</div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-4 mb-4 border border-blue-500/20">
      <div className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Pending Approval</div>

      {anomaly.outreach_draft && (
        <div className="bg-black/30 rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
            {anomaly.outreach_draft}
          </pre>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={async () => {
            setLocalStatus('sending')
            await approveOutreach(anomaly.id)
            setLocalStatus('sent')
          }}
          disabled={localStatus === 'sending'}
          className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-60"
        >
          {localStatus === 'sending' ? 'Sending…' : 'Approve & Send'}
        </button>
        <button
          onClick={async () => {
            setLocalStatus('rejected')
            await rejectOutreach(anomaly.id)
          }}
          disabled={localStatus === 'sending'}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 text-sm rounded-lg transition disabled:opacity-60"
        >
          Reject
        </button>
      </div>
    </div>
  )
}
