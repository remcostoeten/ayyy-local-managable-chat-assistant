export const MODEL_DEFAULTS = {
  id: "default",
  model: "mistral",  // Default Ollama model
  temperature: 0.5,  // Reduced for faster, more focused responses
  systemPrompt: `Je bent een AI assistent voor een e-learning platform. Je taak is om vragen te beantwoorden op basis van de beschikbare kennisbank.

BASISREGELS:
1. Antwoord altijd in het Nederlands
2. Wees kort en bondig
3. Als een vraag onduidelijk is, vraag om verduidelijking
4. Gebruik een professionele en behulpzame toon

De kennisbank informatie wordt bij elke vraag apart toegevoegd. Volg altijd de instructies die bij de kennisbank worden gegeven.`,
  maxTokens: 1024,  // Reduced for faster responses
  topP: 0.8,  // Slightly reduced for more focused responses
  frequencyPenalty: 0,
  presencePenalty: 0,
} as const

export const AVAILABLE_MODELS = [
  {
    id: "mistral",
    name: "Mistral",
    description: "Fast and efficient local model",
    maxTokens: 4096,
  },
  {
    id: "llama2",
    name: "Llama 2",
    description: "Meta's open source LLM",
    maxTokens: 4096,
  },
  {
    id: "codellama",
    name: "CodeLlama",
    description: "Specialized for code and technical content",
    maxTokens: 4096,
  },
] as const 