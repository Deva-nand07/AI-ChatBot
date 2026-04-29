import { useState } from 'react'
import { Copy, Check, User, Zap, FileText, Image } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function MessageBubble({ message, isLast, isStreaming, onCopy, copied }) {
  const isUser = message.role === 'user'
  const text = typeof message.content === 'string'
    ? message.content
    : message.displayText || message.content?.find?.(p => p.type === 'text')?.text || ''

  const msgId = message.id

  return (
    <div className={`flex gap-3 py-3 animate-slide-up group ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
        ${isUser
          ? 'bg-muted border border-border'
          : 'glow-accent-sm'}`}
        style={!isUser ? { background: 'linear-gradient(135deg, #6ee7b7 0%, #3b82f6 100%)' } : {}}
      >
        {isUser
          ? <User size={13} className="text-dim" />
          : <Zap size={12} className="text-bg" />}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[85%] ${isUser ? 'flex flex-col items-end' : ''}`}>
        {/* Attachments */}
        {message.attachments?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.attachments.map((att, i) => (
              <div key={i} className="file-chip flex items-center gap-2 rounded-lg px-3 py-2">
                {att.type === 'image' && att.preview ? (
                  <img src={att.preview.startsWith('data:') ? att.preview : `data:image/jpeg;base64,${att.preview}`}
                    alt={att.name} className="w-10 h-10 rounded object-cover" />
                ) : (
                  <FileText size={16} className="text-accent" />
                )}
                <span className="text-xs text-text">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Message content */}
        <div className={`relative rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-accent/15 border border-accent/20 text-text'
            : 'bg-surface border border-border text-text'
        }`}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          ) : (
            <div className="prose-chat">
              <ReactMarkdown>{text}</ReactMarkdown>
              {isStreaming && isLast && (
                <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse" />
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isUser && text && (
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCopy(text, msgId)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-dim hover:text-text hover:bg-surface transition-colors"
            >
              {copied === msgId ? <Check size={12} className="text-accent" /> : <Copy size={12} />}
              {copied === msgId ? 'Copied' : 'Copy'}
            </button>
            {message.model && (
              <span className="text-xs text-muted px-2">{message.model.split('-').slice(0, 2).join('-')}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
