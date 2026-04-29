/**
 * Call Groq API with streaming
 * Uses fetch directly to avoid SDK bundling issues with Vite
 */
export async function callGroq({ apiKey, model, messages, signal }) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 4096,
      temperature: 0.7,
    }),
    signal,
  })

  if (!response.ok) {
    let errMsg = `API error ${response.status}`
    try {
      const errData = await response.json()
      errMsg = errData?.error?.message || errMsg
    } catch {}
    throw new Error(errMsg)
  }

  return parseSSEStream(response.body)
}

async function* parseSSEStream(body) {
  const reader = body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)
      if (data === '[DONE]') return
      try {
        yield JSON.parse(data)
      } catch {}
    }
  }
}
