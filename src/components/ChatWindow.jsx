import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Send, PanelLeft, Plus, Paperclip, Image, X, FileText,
  Copy, Check, RotateCcw, ChevronDown, Zap, AlertCircle
} from 'lucide-react'
import MessageBubble from './MessageBubble'
import ModelPill from './ModelPill'
import { fileToBase64, formatFileSize } from '../utils/helpers'
import { callGroq } from '../utils/groq'

const WELCOME_PROMPTS = [
  'Explain quantum entanglement simply',
  'Write a Python web scraper',
  'Summarize the key ideas of stoicism',
  'Debug my React useEffect hook',
]

export default function ChatWindow({
  conversation, apiKey, model, models, sidebarOpen,
  onToggleSidebar, onNewChat, onEditApiKey,
  onUpdate, onCreateAndUpdate, setActiveConvId, onSelectModel
}) {
  const [input, setInput] = useState('')
  const [attachments, setAttachments] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(null)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const abortRef = useRef(null)

  const messages = conversation?.messages || []

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  const handleFile = async (file, type) => {
    const base64 = await fileToBase64(file)
    setAttachments(prev => [...prev, {
      id: Math.random().toString(36).slice(2),
      name: file.name,
      size: file.size,
      type,
      mimeType: file.type,
      base64,
      preview: type === 'image' ? base64 : null,
    }])
  }

  const handleFiles = (files, type) => {
    Array.from(files).forEach(f => handleFile(f, type))
  }

  const removeAttachment = (id) => setAttachments(prev => prev.filter(a => a.id !== id))

  const buildUserContent = (text, atts) => {
    if (!atts.length) return text
    const parts = []
    atts.forEach(att => {
      if (att.type === 'image') {
        parts.push({ type: 'image_url', image_url: { url: `data:${att.mimeType};base64,${att.base64}` } })
      } else {
        parts.push({ type: 'text', text: `[File: ${att.name}]\n${att.base64 ? atob(att.base64).slice(0, 2000) : ''}` })
      }
    })
    parts.push({ type: 'text', text })
    return parts
  }

  const sendMessage = useCallback(async () => {
    if ((!input.trim() && !attachments.length) || isStreaming || !apiKey) return

    const userContent = buildUserContent(input.trim(), attachments)
    const userMsg = {
      id: Math.random().toString(36).slice(2),
      role: 'user',
      content: userContent,
      displayText: input.trim(),
      attachments: attachments.map(a => ({ name: a.name, size: a.size, type: a.type, preview: a.preview })),
      ts: Date.now(),
    }

    setInput('')
    setAttachments([])
    setError(null)
    setIsStreaming(true)

    let convId = conversation?.id

    const assistantMsg = {
      id: Math.random().toString(36).slice(2),
      role: 'assistant',
      content: '',
      ts: Date.now(),
      model: model.id,
    }

    if (!convId) {
      convId = crypto.randomUUID()
      const titleText = typeof userContent === 'string'
        ? userContent
        : userContent.find(p => p.type === 'text')?.text || 'New Chat'
      const newConv = {
        id: convId,
        title: titleText.slice(0, 45),
        model: model.id,
        messages: [userMsg, assistantMsg],
        createdAt: Date.now(),
      }
      if (onCreateAndUpdate) {
        onCreateAndUpdate(newConv, convId, setActiveConvId)
      }
    } else {
      onUpdate(c => ({
        ...c,
        messages: [...c.messages, userMsg, assistantMsg],
      }))
    }

    // For new convs, onUpdate may not have convId yet — pass convId explicitly
    const updateMsg = (updater) => {
      if (onUpdate) onUpdate(updater)
      else {
        // update via setConversations with convId
        setActiveConvId && setActiveConvId(convId)
      }
    }

    const historyMessages = [...(conversation?.messages || []), userMsg].map(m => ({
      role: m.role,
      content: typeof m.content === 'string' ? m.content : m.content,
    }))

    try {
      const stream = await callGroq({ apiKey, model: model.id, messages: historyMessages })
      let fullText = ''

      for await (const chunk of stream) {
        const delta = chunk.choices?.[0]?.delta?.content || ''
        fullText += delta
        const captured = fullText
        onUpdate && onUpdate(c => ({
          ...c,
          messages: c.messages.map(m =>
            m.id === assistantMsg.id ? { ...m, content: captured } : m
          ),
        }))
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong')
        onUpdate && onUpdate(c => ({
          ...c,
          messages: c.messages.map(m =>
            m.id === assistantMsg.id ? { ...m, content: '⚠️ Error: ' + (err.message || 'Failed to get response'), error: true } : m
          ),
        }))
      }
    } finally {
      setIsStreaming(false)
    }
  }, [input, attachments, isStreaming, apiKey, model, conversation, onUpdate, onCreateAndUpdate, setActiveConvId])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyMessage = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const isEmpty = messages.length === 0

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 relative">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-surface/50 backdrop-blur-sm flex-shrink-0">
        {!sidebarOpen && (
          <button onClick={onToggleSidebar}
            className="p-1.5 rounded-md text-dim hover:text-text hover:bg-muted/40 transition-colors">
            <PanelLeft size={16} />
          </button>
        )}

        <div className="flex-1 flex items-center gap-3 min-w-0">
          {conversation ? (
            <span className="text-sm text-text font-medium truncate">{conversation.title}</span>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6ee7b7 0%, #3b82f6 100%)' }}>
                <Zap size={11} className="text-bg" />
              </div>
              <span className="text-sm font-semibold text-text">Groq Chat</span>
            </div>
          )}
        </div>

        <ModelPill model={model} models={models} onSelect={onSelectModel} />

        <button onClick={onNewChat}
          className="p-1.5 rounded-md text-dim hover:text-text hover:bg-muted/40 transition-colors">
          <Plus size={16} />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-6 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 glow-accent"
              style={{ background: 'linear-gradient(135deg, #6ee7b720 0%, #3b82f620 100%)', border: '1px solid rgba(110,231,183,0.2)' }}>
              <Zap size={24} className="text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-text mb-2">What's on your mind?</h2>
            <p className="text-sm text-dim mb-10 text-center max-w-sm">
              Powered by <span className="text-accent font-medium">{model.name}</span> via Groq's ultra-fast inference
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {WELCOME_PROMPTS.map(prompt => (
                <button key={prompt}
                  onClick={() => { setInput(prompt); textareaRef.current?.focus() }}
                  className="px-4 py-3 rounded-xl text-left text-sm text-dim hover:text-text border border-border hover:border-muted bg-surface/60 hover:bg-surface transition-all">
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-1">
            {messages.map((msg, i) => (
              <MessageBubble
                key={msg.id || i}
                message={msg}
                isLast={i === messages.length - 1}
                isStreaming={isStreaming && i === messages.length - 1}
                onCopy={copyMessage}
                copied={copied}
              />
            ))}
            {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-3 py-3 animate-fade-in">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #6ee7b7 0%, #3b82f6 100%)' }}>
                  <Zap size={12} className="text-bg" />
                </div>
                <div className="flex items-center gap-1 pt-2">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="typing-dot w-1.5 h-1.5 rounded-full bg-accent" />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up">
          <AlertCircle size={14} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="hover:text-red-300">
            <X size={14} />
          </button>
        </div>
      )}

      {!apiKey && (
        <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
          <AlertCircle size={14} />
          <span>No API key set.</span>
          <button onClick={onEditApiKey} className="underline hover:text-yellow-300">Set it here</button>
        </div>
      )}

      {/* Input area */}
      <div className="px-4 pb-4 pt-2 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 px-1">
              {attachments.map(att => (
                <div key={att.id} className="file-chip flex items-center gap-2 rounded-lg px-3 py-2">
                  {att.preview ? (
                    <img src={`data:${att.mimeType};base64,${att.base64}`} alt={att.name}
                      className="w-8 h-8 rounded object-cover flex-shrink-0" />
                  ) : (
                    <FileText size={16} className="text-accent flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs text-text truncate max-w-32">{att.name}</div>
                    <div className="text-xs text-dim">{formatFileSize(att.size)}</div>
                  </div>
                  <button onClick={() => removeAttachment(att.id)}
                    className="text-dim hover:text-red-400 transition-colors flex-shrink-0">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input box */}
          <div className="input-container flex items-end gap-2 bg-surface rounded-2xl border border-border px-4 py-3 transition-all">
            {/* File buttons */}
            <div className="flex items-center gap-1 pb-0.5">
              <button onClick={() => imageInputRef.current?.click()}
                className="p-1.5 rounded-lg text-dim hover:text-accent hover:bg-accent/10 transition-colors"
                title="Attach image">
                <Image size={16} />
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-dim hover:text-accent hover:bg-accent/10 transition-colors"
                title="Attach file">
                <Paperclip size={16} />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Groq..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-text placeholder-dim text-sm leading-relaxed max-h-48 min-h-[24px] py-0.5"
            />

            <button
              onClick={sendMessage}
              disabled={(!input.trim() && !attachments.length) || isStreaming || !apiKey}
              className={`flex-shrink-0 p-2 rounded-xl transition-all ${
                (input.trim() || attachments.length) && !isStreaming && apiKey
                  ? 'bg-accent text-bg hover:bg-accent/90 glow-accent-sm'
                  : 'bg-muted/40 text-dim cursor-not-allowed'
              }`}
            >
              {isStreaming ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>

          <p className="text-center text-xs text-muted mt-2">
            Enter to send · Shift+Enter for new line · Groq ultra-fast inference
          </p>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input ref={imageInputRef} type="file" accept="image/*" multiple hidden
        onChange={e => handleFiles(e.target.files, 'image')} />
      <input ref={fileInputRef} type="file" accept=".txt,.md,.pdf,.json,.csv,.js,.ts,.py,.html,.css" multiple hidden
        onChange={e => handleFiles(e.target.files, 'file')} />
    </main>
  )
}
