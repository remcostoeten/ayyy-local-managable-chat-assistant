# 🚀 AI-Powered Knowledge Base Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)]()
[![Next.js 14](https://img.shields.io/badge/Next.js_14-black?style=flat-square&logo=next.js&logoColor=white)]()
[![Turso](https://img.shields.io/badge/Turso-00ADD8?style=flat-square&logo=sqlite&logoColor=white)]()
[![RAG](https://img.shields.io/badge/RAG-🔥-yellow?style=flat-square)]()

> 🌟 **Supercharge your knowledge base with AI!** Built with Next.js 14, Turso, and a dash of magic ✨

## 🎯 What Makes This Awesome?

### 🎨 Stunning Admin Dashboard
- **Drop-dead Gorgeous UI**: Powered by shadcn/ui + Tailwind CSS
- **Theme Paradise**: 
  - 🎨 Catpuccini vibes
  - ⚡ Supabase sleekness
  - ☕ Caffeine kick
  - 🌙 Night Bourbon elegance
- **Smooth Animations**: Framer Motion goodness
- **Dark/Light Magic**: Seamless theme switching

### 🧠 AI Superpowers
- **Smart Document Processing**: Let AI do the heavy lifting
- **Vector Magic**: Transform documents into searchable knowledge
- **RAG Integration**: Context-aware responses that make sense
- **Multi-Model Support**: Choose your AI champion
  
  #### 🖥️ Local Models (via Ollama)
  - 🚀 **Recommended Models**:
    - Mistral 7B (4.1GB): Fast responses, excellent Dutch support
    - Neural-Chat (4.8GB): Optimized for chat interactions
  
  - 🔄 **Alternative Models**:
    - Llama 2 7B (3.8GB): Meta's latest model, good all-rounder
    - Llama 2 13B (7.3GB): Larger, more capable version
  
  - 🪶 **Lightweight Options**:
    - TinyLlama (1.2GB): Ultra lightweight, perfect for testing
    - Phi-2 (1.7GB): Microsoft's small but mighty model
  
  #### ☁️ Cloud Integration
  - **OpenAI Integration**:
    - GPT-3.5 Turbo and GPT-4 support
    - Configurable model selection
    - Perfect for production deployments
  - **Groq Integration**:
    - Ultra-fast inference
    - Free credits for new users
  - **Secure API Key Storage**:
    - 🔒 Military-grade AES-256-GCM encryption
    - Secure key verification before storage
    - Zero plaintext storage
  - **Easy Configuration**:
    - Simple admin interface
    - Real-time provider switching
    - Instant model selection

### ⚡ Lightning Fast with Turso
- **Edge-Ready Database**: Powered by libSQL
- **Global Distribution**: Your data, everywhere
- **Blazing Performance**: Built for speed
- **Rock-Solid Foundation**: Enterprise-grade reliability

## 🚀 Quick Start

```bash
# Clone this beauty
git clone https://github.com/remcostoeten/ayyy-local-RAG-vector-embeddings-knowledge-base ayyy
cd ayyy

# Install dependencies
# or bun
pnpm install

# setup Turso, and encryption keys
cp .env.example .env
echo "running script to generate encryption keys and write them to .env "
pnpm run generate-keys
echo "installing models..."
# Install AI models (interactive)
pnpm run install-models

#
echo "don't forget your turso db auth token in .env"
echo "retrieve it from https://turso.tech/ and add it to .env"

sleep 1
echo "now you can start the app with: pnpm dev"
# Light it up! 🔥
pnpm dev 
```

### 📦 Model Installation

The `install-models` script provides an interactive installation experience:

1. View detailed information about available models
2. Select which models to install (space to select, return to confirm)
3. Models are grouped by category:
   - Recommended: Best for most use cases
   - Alternative: Additional powerful options
   - Lightweight: Perfect for testing
4. See size requirements before downloading

> 💡 **Note**: Local models require disk space (1.2GB - 7.3GB each). For testing, start with lightweight options like TinyLlama (1.2GB) or Phi-2 (1.7GB).

> 💡 **Cloud Models**: Groq integration is configured separately in the admin interface under Settings.

## 💪 Tech Stack of Champions

- **Frontend**: 
  - 🔥 Next.js 14 (App Router)
  - ⚛️ React (Latest and Greatest)
  - 📘 TypeScript (Type Safety FTW)
  
- **Styling**: 
  - 🎨 Tailwind CSS
  - 🎭 shadcn/ui (Beautiful Components)
  - ✨ Framer Motion (Smooth Animations)
  
- **Database & AI**: 
  - 🚀 Turso (Edge Database)
  - 🧠 Vector Embeddings (Coming Soon)
  - 🤖 RAG Integration (In Progress)
  - 🎯 Local AI Models via Ollama

- **Development**: 
  - 📦 pnpm (Fast & Efficient)
  - ⚡ Bun (Speed Demon)
  - 🛠️ DrizzleORM (Type-Safe Queries)

## 🌈 Features in the Pipeline

Get hyped for what's coming:
- 🔍 Advanced semantic search
- 📊 Real-time analytics dashboard
- 🤖 Custom AI model integration
- 🔐 Enterprise-grade security
- 📱 Mobile app companion

## 🏗️ Architecture

```mermaid
graph TD
    A[Your Content] -->|Magic| B[AI Processor]
    B -->|Vector Embedding| C[Turso DB]
    C -->|Lightning Fast| D[Knowledge Base]
    D -->|Smart Retrieval| E[RAG Engine]
    E -->|AI Enhanced| F[Responses]
```

## 🚀 Performance

Built for speed and scale with:
- ⚡ Edge-ready architecture
- 🌍 Global data distribution
- 🚄 Optimized queries
- 🎯 Smart caching

## 🌟 Coming Soon

We're cooking up some incredible features:
- 📱 Mobile app
- 🔄 Real-time collaboration
- 🎯 Custom AI fine-tuning
- 🌐 API marketplace

## 🛠️ Development Status

- ✅ Admin Dashboard
- ✅ Theme System
- ✅ Turso Integration
- ✅ Model Management
- ✅ Secure API Key Storage
- ✅ OpenAI Integration
- ✅ Groq Integration
- 🏗️ RAG Implementation
- 🏗️ Vector Search
- 🎯 Analytics (Planned)

---

<p align="center">
  <strong>Built with ❤️ by [remco stoeten](https://github.com/remcostoeten)</strong>
</p>

## Additional information

### Models & Integration

#### Local Models (via Ollama)
The app supports various local models through Ollama:
- **Recommended**:
  - Mistral 7B: Fast responses, excellent Dutch support (4.1GB)
  - Neural-Chat: Optimized for chat interactions (4.8GB)
- **Alternative**:
  - Llama 2 models: Available in 7B and 13B versions
- **Lightweight**:
  - TinyLlama and Phi-2: Perfect for testing (1.2-1.7GB)

<details>

~/s/ayyyyyyyyyyyyyyyyy (master) > pnpm dev

> ayyy-local-rag-vector-knowledge-base@0.1.0 dev /home/remcostoeten/sandbox/aibot
> tsx scripts/check-ollama.ts && next dev


   ╭──────────────────────────────────────────────────────╮
   │                                                      │
   │   🚀 AI Model Setup Assistant                        │
   │                                                      │
   │   This will help you set up all required AI models   │
   │   for your application to work properly.             │
   │                                                      │
   ╰──────────────────────────────────────────────────────╯

✔ Ollama is running and healthy

   ╭────────────────────────────────────────────────────────────────╮
   │                                                                │
   │   ### Available Models                                         │
   │                                                                │
   │   ● mixtral:latest                                             │
   │     Description: Custom model                                  │
   │     Size: 24.6 GB                                              │
   │     Max Tokens: Unknown                                        │
   │     Last modified: 22/05/2025, 11:22:45 pm                     │
   │                                                                │
   │   ● mistral:latest ⭐                                          │
   │     Description: Fast responses, good English, ideal for FAQ   │
   │     Size: 3.8 GB                                               │
   │     Max Tokens: 4096                                           │
   │     Last modified: 22/05/2025, 11:12:51 pm                     │
   │                                                                │
   │   ● codellama:latest                                           │
   │     Description: Custom model                                  │
   │     Size: 3.6 GB                                               │
   │     Max Tokens: Unknown                                        │
   │     Last modified: 22/05/2025, 11:12:00 pm                     │
   │                                                                │
   │   ● llama2:latest                                              │
   │     Description: Meta's latest model, good all-rounder         │
   │     Size: 3.6 GB                                               │
   │     Max Tokens: 4096                                           │
   │     Last modified: 22/05/2025, 11:10:57 pm                     │
   │                                                                │
   ╰────────────────────────────────────────────────────────────────╯


   ╭────────────────────────────────────────────────────────────────────╮
   │                                                                    │
   │   ### Additional Available Models                                  │
   │                                                                    │
   │   ○ Neural-Chat ⭐                                                 │
   │     Description: Optimized for chat interactions, very efficient   │
   │     Max Tokens: 8192                                               │
   │                                                                    │
   │   ○ Llama 2 13B                                                    │
   │     Description: Larger, more powerful version of Llama 2          │
   │     Max Tokens: 8192                                               │
   │                                                                    │
   │   ○ TinyLlama                                                      │
   │     Description: Ultra lightweight model, perfect for testing      │
   │     Max Tokens: 2048                                               │
   │                                                                    │
   │   ○ Phi-2                                                          │
   │     Description: Microsoft's small but powerful model              │
   │     Max Tokens: 2048                                               │
   │                          
</details>

#### Cloud Integration
For users who prefer cloud-based inference:
- Configure Groq API key in the admin interface
- Get free credits when signing up
- No additional setup required

## 🔐 Security Features

- **API Key Protection**:
  - AES-256-GCM encryption for all API keys
  - Secure key verification system
  - No plaintext storage in database
  - Encrypted at rest and in transit
  
- **Access Control**:
  - Role-based admin access
  - Secure admin dashboard
  - Activity logging and monitoring
