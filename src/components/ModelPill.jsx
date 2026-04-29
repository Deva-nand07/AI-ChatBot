import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Zap } from 'lucide-react'

export default function ModelPill({ model, models, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-muted transition-colors text-sm"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
        <span className="text-text font-medium hidden sm:block">{model.name}</span>
        <span className="text-dim text-xs">{model.label}</span>
        <ChevronDown size={13} className={`text-dim transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-bg border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="px-3 py-2 border-b border-border">
            <span className="text-xs text-dim font-medium uppercase tracking-wider">Select Model</span>
          </div>
          {models.map(m => (
            <button key={m.id}
              onClick={() => { onSelect(m); setOpen(false) }}
              className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-surface transition-colors text-left
                ${model.id === m.id ? 'bg-surface/80' : ''}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-text">{m.name}</span>
                  <span className="text-xs bg-accent/15 text-accent px-1.5 py-0.5 rounded font-medium">{m.badge}</span>
                </div>
                <p className="text-xs text-dim">{m.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-muted">Ctx: {m.context}</span>
                  <span className={`text-xs font-medium ${m.speed === 'Blazing' ? 'text-yellow-400' : 'text-accent'}`}>
                    ⚡ {m.speed}
                  </span>
                </div>
              </div>
              {model.id === m.id && <Check size={15} className="text-accent mt-1 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
