export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = !isProduction;

export const featureFlags = {
  enableEasterEggs: isDevelopment || process.env.NEXT_PUBLIC_ENABLE_EASTER_EGGS === 'true',
  enableDebugMessages: isDevelopment || process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  enableTestPrompts: isDevelopment || process.env.NEXT_PUBLIC_ENABLE_TEST_PROMPTS === 'true',
} as const;

export type LoadingMessageType = {
  text: string;
  lang: 'en' | 'nl';
};

export const assistantDefaults = {
  production: {
    name: "AI Assistant",
    description: "Your helpful AI assistant",
    defaultStatus: "active",
    easterEggPercentage: 15,
    loadingMessages: [
      { text: "Processing your request...", lang: "en" },
      { text: "Analyzing the information...", lang: "en" },
      { text: "Crafting a response...", lang: "en" },
      { text: "Thinking it through...", lang: "en" },
      { text: "Even geduld, ik denk na...", lang: "nl" },
      { text: "Bezig met verwerken...", lang: "nl" },
      { text: "Ik zoek het even uit...", lang: "nl" },
      { text: "Moment, ik ben er zo...", lang: "nl" }
    ] as LoadingMessageType[]
  },
  development: {
    name: "Henk",
    description: "houdt van ijskoffie",
    defaultStatus: "active",
    easterEggPercentage: 50,
    loadingMessages: [
      { text: "Even geduld! Ik kom er aan, ben even ijskoffie maken", lang: "nl" },
      { text: "Momentje, ijskoffie aan het inschenken...", lang: "nl" },
      { text: "Slurp... even mijn ijskoffie opdrinken!", lang: "nl" },
      { text: "Druk bezig met ijskoffie en jouw antwoord...", lang: "nl" },
      { text: "Searching through knowledge base...", lang: "en" },
      { text: "Gathering relevant information...", lang: "en" },
      { text: "Analyzing the context...", lang: "en" },
      { text: "Formulating a detailed response...", lang: "en" }
    ] as LoadingMessageType[]
  }
} as const; 