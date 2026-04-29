import { useState } from 'react'
import { Key, Eye, EyeOff, ExternalLink, X, Zap, Check } from 'lucide-react'

export default function ApiKeyModal({ current, onSave, onClose, models }) {
  const [key, setKey] = useState(current || '')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')

  const handleSave = () => {
    const trimmed = key.trim()
    if (!trimmed.startsWith('gsk_')) {
      setError('Groq API keys start with "gsk_"')
      return
    }
    onSave(trimmed)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-surface border border-border rounded-2xl w-full max-w-md shadow-2xl animate-slide-up overflow-hidden">
        {/* Accent top bar */}
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #6ee7b7 0%, #3b82f6 100%)' }} />

        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6ee7b720 0%, #3b82f620 100%)', border: '1px solid rgba(110,231,183,0.2)' }}>
                <Key size={18} className="text-accent" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text">Groq API Key</h2>
                <p className="text-xs text-dim mt-0.5">Required to use the chatbot</p>
              </div>
            </div>
            {onClose && (
              <button onClick={onClose}
                className="p-1.5 rounded-lg text-dim hover:text-text hover:bg-muted/40 transition-colors">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Key input */}
          <div className="mb-4">
            <label className="block text-xs text-dim mb-2 font-medium uppercase tracking-wider">API Key</label>
            <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-4 py-3 focus-within:border-accent/40 transition-colors">
              <input
                type={show ? 'text' : 'password'}
                value={key}
                onChange={e => { setKey(e.target.value); setError('') }}
                placeholder="gsk_••••••••••••••••••••••••"
                className="flex-1 bg-transparent text-text text-sm outline-none placeholder-muted font-mono"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus
              />
              <button onClick={() => setShow(s => !s)}
                className="text-dim hover:text-text transition-colors flex-shrink-0">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {error && <p className="text-xs text-red-400 mt-1.5">{error}</p>}
            <p className="text-xs text-dim mt-2">
              Your key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          {/* Get key link */}
          <a
            href="https://console.groq.com/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-accent hover:text-accent/80 transition-colors mb-6"
          >
            <ExternalLink size={12} />
            Get a free API key at console.groq.com
          </a>

          {/* Available models preview */}
          <div className="bg-bg rounded-xl border border-border p-3 mb-5">
            <p className="text-xs text-dim mb-2 font-medium uppercase tracking-wider">Available Models</p>
            <div className="space-y-1.5">
              {models.map(m => (
                <div key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                    <span className="text-xs text-text">{m.name}</span>
                  </div>
                  <span className="text-xs text-accent font-mono">{m.badge}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={!key.trim()}
            className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all ${
              key.trim()
                ? 'bg-accent text-bg hover:bg-accent/90 glow-accent-sm'
                : 'bg-muted/40 text-dim cursor-not-allowed'
            }`}
          >
            Save & Start Chatting
          </button>
        </div>
      </div>
    </div>
  )
}
