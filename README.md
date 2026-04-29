# Groq Chat

A modern, minimalist chatbot powered by [Groq](https://groq.com)'s ultra-fast LLM inference API.

Built with React + Vite + Tailwind CSS.

## Features

-  **4 AI Models** — LLaMA 3.3 70B, LLaMA 3.1 8B Instant, Mixtral 8×7B, Gemma 2 9B
-  **File & Image Uploads** — Attach images and text files to your messages
-  **Multi-conversation** — Sidebar with conversation history, persistent across sessions
-  **Streaming responses** — Real-time token-by-token streaming
-  **Dark minimalist UI** — Clean dark theme with subtle emerald accents
-  **Markdown rendering** — Code blocks, tables, lists, and more
-  **Local API key storage** — Stored in your browser only, never sent to external servers

## Setup

### 1. Get a Groq API Key

Sign up at [console.groq.com](https://console.groq.com) — it's free!

### 2. Install dependencies

```bash
npm install
```

### 3. Start the dev server

```bash
npm run dev
```

### 4. Open and enter your API key

Visit `http://localhost:5173` and enter your Groq API key when prompted.

## Build for Production

```bash
npm run build
npm run preview
```

## Available Models

| Model | Context | Speed | Best For |
|-------|---------|-------|----------|
| LLaMA 3.3 70B Versatile | 128K | Fast | Complex reasoning, long documents |
| LLaMA 3.1 8B Instant | 128K | Blazing | Quick tasks, chat |
| Mixtral 8×7B | 32K | Fast | Code generation, technical tasks |
| Gemma 2 9B | 8K | Fast | Efficient general use |

## File Upload Support

- **Images**: PNG, JPG, GIF, WebP (sent to vision-capable models)
- **Files**: .txt, .md, .json, .csv, .js, .ts, .py, .html, .css

## Tech Stack

- **React 18** + **Vite**
- **Tailwind CSS** for styling
- **react-markdown** for message rendering
- **Groq REST API** with SSE streaming
- **DM Sans** + **JetBrains Mono** fonts
