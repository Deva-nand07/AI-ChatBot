import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import ApiKeyModal from './components/ApiKeyModal'
import { generateId } from './utils/helpers'

const MODELS = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'LLaMA 3.3 70B',
    label: 'Versatile',
    description: 'Best for complex reasoning & long context',
    context: '128K',
    speed: 'Fast',
    badge: 'Recommended',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'LLaMA 3.1 8B',
    label: 'Instant',
    description: 'Ultra-fast for quick tasks & chat',
    context: '128K',
    speed: 'Blazing',
    badge: 'Fastest',
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8×7B',
    label: 'MoE',
    description: 'Mixture of experts, great for code',
    context: '32K',
    speed: 'Fast',
    badge: 'Code',
  },
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B',
    label: 'Google',
    description: "Google's efficient open model",
    context: '8K',
    speed: 'Fast',
    badge: 'Efficient',
  },
]

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('groq_api_key') || '')
  const [showApiModal, setShowApiModal] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0])
  const [conversations, setConversations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('groq_conversations') || '[]')
    } catch { return [] }
  })
  const [activeConvId, setActiveConvId] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (!apiKey) setShowApiModal(true)
  }, [])

  useEffect(() => {
    localStorage.setItem('groq_conversations', JSON.stringify(conversations))
  }, [conversations])

  const activeConversation = conversations.find(c => c.id === activeConvId) || null

  const createNewConversation = () => {
    const id = generateId()
    const conv = {
      id,
      title: 'New Chat',
      model: selectedModel.id,
      messages: [],
      createdAt: Date.now(),
    }
    setConversations(prev => [conv, ...prev])
    setActiveConvId(id)
    return id
  }

  const updateConversation = (id, updater) => {
    setConversations(prev => prev.map(c => c.id === id ? updater(c) : c))
  }

  const deleteConversation = (id) => {
    setConversations(prev => prev.filter(c => c.id !== id))
    if (activeConvId === id) setActiveConvId(null)
  }

  const handleSaveApiKey = (key) => {
    setApiKey(key)
    localStorage.setItem('groq_api_key', key)
    setShowApiModal(false)
  }

  return (
    <div className="flex h-screen bg-bg noise overflow-hidden relative">
      {/* Ambient background gradients */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #6ee7b7 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-3"
          style={{ background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 flex w-full h-full">
        <Sidebar
          open={sidebarOpen}
          conversations={conversations}
          activeConvId={activeConvId}
          models={MODELS}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onSelectConv={setActiveConvId}
          onNewChat={createNewConversation}
          onDeleteConv={deleteConversation}
          onToggle={() => setSidebarOpen(o => !o)}
          onEditApiKey={() => setShowApiModal(true)}
          apiKey={apiKey}
        />

        <ChatWindow
          key={activeConvId}
          conversation={activeConversation}
          apiKey={apiKey}
          model={selectedModel}
          models={MODELS}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(o => !o)}
          onSelectModel={setSelectedModel}
          onNewChat={createNewConversation}
          onEditApiKey={() => setShowApiModal(true)}
          onUpdate={(updater) => activeConvId && updateConversation(activeConvId, updater)}
          onCreateAndUpdate={(newConv, convId, setId) => {
            setConversations(prev => [newConv, ...prev])
            setActiveConvId(convId)
            setId && setId(convId)
          }}
          setActiveConvId={setActiveConvId}
        />
      </div>

      {showApiModal && (
        <ApiKeyModal
          current={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => apiKey && setShowApiModal(false)}
          models={MODELS}
        />
      )}
    </div>
  )
}

export { MODELS }
