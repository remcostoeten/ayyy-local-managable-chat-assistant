export const MODEL_DEFAULTS = {
  id: "default",
  model: "mistral", // Default Ollama model
  temperature: 0.3, // Lower temperature for more focused responses
  systemPrompt: `Je bent een AI assistent voor een e-learning platform. Je taak is om vragen te beantwoorden op basis van de beschikbare kennisbank.

BASISREGELS:
1. Antwoord ALTIJD in het Nederlands
2. Gebruik ALLEEN informatie uit de kennisbank
3. Als je iets niet weet, zeg dat eerlijk
4. Wees kort en bondig
5. Als een vraag onduidelijk is, vraag om verduidelijking
6. Gebruik een professionele en behulpzame toon

De kennisbank informatie wordt bij elke vraag apart toegevoegd. Gebruik ALLEEN deze informatie voor je antwoorden.`,
  maxTokens: 512, // Shorter responses for FAQ-style answers
  topP: 0.3, // More focused on highest probability tokens
  frequencyPenalty: 0,
  presencePenalty: 0,
} as const;

export type ModelCategory = "Recommended" | "Alternative" | "Lightweight";

export const AVAILABLE_MODELS = [
  {
    id: "mistral",
    name: "Mistral 7B",
    description: "Fast responses, good English, ideal for FAQ",
    maxTokens: 4096,
    size: "4.1GB",
    recommended: true,
    category: "Recommended" as ModelCategory,
    features: ["Fast", "English", "Compact"],
  },
  {
    id: "neural-chat",
    name: "Neural-Chat",
    description: "Optimized for chat interactions, very efficient",
    maxTokens: 8192,
    size: "4.8GB",
    recommended: true,
    category: "Recommended" as ModelCategory,
    features: ["Chat-focused", "Fast", "Context-aware"],
  },
  {
    id: "llama2",
    name: "Llama 2 7B",
    description: "Meta's latest model, good all-rounder",
    maxTokens: 4096,
    size: "3.8GB",
    recommended: false,
    category: "Alternative" as ModelCategory,
    features: ["Versatile", "Stable", "Open Source"],
  },
  {
    id: "llama2:13b",
    name: "Llama 2 13B",
    description: "Larger, more powerful version of Llama 2",
    maxTokens: 8192,
    size: "7.3GB",
    recommended: false,
    category: "Alternative" as ModelCategory,
    features: ["Powerful", "Accurate", "Large Context"],
  },
  {
    id: "tinyllama",
    name: "TinyLlama",
    description: "Ultra lightweight model, perfect for testing",
    maxTokens: 2048,
    size: "1.2GB",
    recommended: false,
    category: "Lightweight" as ModelCategory,
    features: ["Fast", "Compact", "Test-Friendly"],
  },
  {
    id: "phi",
    name: "Phi-2",
    description: "Microsoft's small but powerful model",
    maxTokens: 2048,
    size: "1.7GB",
    recommended: false,
    category: "Lightweight" as ModelCategory,
    features: ["Efficient", "Compact", "Versatile"],
  },
] as const;
