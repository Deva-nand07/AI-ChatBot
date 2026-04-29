import { useState } from 'react'
import {
  Plus, ChevronLeft, ChevronRight, MessageSquare, Trash2,
  Key, Zap, ChevronDown, Check, Settings
} from 'lucide-react'

export default function Sidebar({
  open, conversations, activeConvId, models, selectedModel,
  onSelectModel, onSelectConv, onNewChat, onDeleteConv,
  onToggle, onEditApiKey, apiKey
}) {
  const [modelOpen, setModelOpen] = useState(false)
  const [hoverConv, setHoverConv] = useState(null)

  const speedColor = (s) => s === 'Blazing' ? 'text-yellow-400' : s === 'Fast' ? 'text-accent' : 'text-dim'

  return (
    <>
      {/* Sidebar */}
      <aside
        className="flex flex-col h-full bg-surface border-r border-border transition-all duration-300 overflow-hidden flex-shrink-0"
        style={{ width: open ? 260 : 0, minWidth: open ? 260 : 0 }}
      >
        <div className="flex flex-col h-full" style={{ width: 260 }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-border">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center glow-accent-sm"
                style={{ background: 'linear-gradient(135deg, #6ee7b7 0%, #3b82f6 100%)' }}>
                <Zap size={14} className="text-bg" />
              </div>
              <span className="font-semibold text-text text-sm tracking-wide">Groq Chat</span>
            </div>
            <button onClick={onToggle}
              className="p-1.5 rounded-md text-dim hover:text-text hover:bg-muted/40 transition-colors">
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Model Selector */}
          <div className="px-3 py-3 border-b border-border">
            <button
              onClick={() => setModelOpen(o => !o)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-bg border border-border hover:border-muted transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-medium text-text truncate">{selectedModel.name}</div>
                  <div className="text-xs text-dim truncate">{selectedModel.label}</div>
                </div>
              </div>
              <ChevronDown size={14} className={`text-dim transition-transform flex-shrink-0 ${modelOpen ? 'rotate-180' : ''}`} />
            </button>

            {modelOpen && (
              <div className="mt-2 rounded-lg border border-border bg-bg overflow-hidden animate-fade-in">
                {models.map(m => (
                  <button key={m.id}
                    onClick={() => { onSelectModel(m); setModelOpen(false) }}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 hover:bg-surface transition-colors text-left
                      ${selectedModel.id === m.id ? 'bg-surface' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text">{m.name}</span>
                        <span className="text-xs text-accent font-mono">{m.badge}</span>
                      </div>
                      <div className="text-xs text-dim mt-0.5 truncate">{m.description}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-dim">{m.context}</span>
                        <span className={`text-xs font-medium ${speedColor(m.speed)}`}>{m.speed}</span>
                      </div>
                    </div>
                    {selectedModel.id === m.id && <Check size={13} className="text-accent mt-0.5 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New Chat */}
          <div className="px-3 py-2">
            <button onClick={onNewChat}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-dashed border-muted/60 text-dim hover:text-text hover:border-accent/40 hover:bg-surface/50 transition-all text-sm">
              <Plus size={14} />
              <span>New Chat</span>
            </button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-0.5">
            {conversations.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare size={24} className="text-muted mx-auto mb-3" />
                <p className="text-xs text-dim">No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div key={conv.id}
                  className="relative group"
                  onMouseEnter={() => setHoverConv(conv.id)}
                  onMouseLeave={() => setHoverConv(null)}
                >
                  <button
                    onClick={() => onSelectConv(conv.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all text-sm
                      ${activeConvId === conv.id
                        ? 'bg-accent/10 border border-accent/20 text-text'
                        : 'text-dim hover:text-text hover:bg-surface/80'}`}
                  >
                    <MessageSquare size={13} className={activeConvId === conv.id ? 'text-accent' : 'text-muted'} />
                    <span className="flex-1 truncate">{conv.title}</span>
                  </button>
                  {hoverConv === conv.id && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteConv(conv.id) }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-dim hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-3 py-3 border-t border-border space-y-1">
            <button
              onClick={onEditApiKey}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-dim hover:text-text hover:bg-surface/80 transition-colors text-sm"
            >
              <Key size={14} />
              <span className="flex-1 text-left">API Key</span>
              {apiKey ? (
                <span className="text-xs text-accent font-mono">••••{apiKey.slice(-4)}</span>
              ) : (
                <span className="text-xs text-red-400">Not set</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Toggle when closed */}
      {!open && (
        <button
          onClick={onToggle}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-surface border border-border rounded-r-lg text-dim hover:text-text transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      )}
    </>
  )
}
