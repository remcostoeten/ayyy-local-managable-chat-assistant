import { type AVAILABLE_MODELS } from '../config/model-defaults';

export type ModelId = typeof AVAILABLE_MODELS[number]['id'];

// Types for database schema
export interface ModelSettings {
  id: string;
  displayName: string;
  modelTag: string;
  tooltip: string;
  badgeColor: string;
  isEnabled: boolean;
  isDefault: boolean;
  features: ModelFeatures;
  adminNotes: string;
  maxTokens: number;
  temperature: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelFeatures {
  speed: number;             // 1-5 scale
  dutch: number;             // 1-5 scale
  contextUnderstanding: number; // 1-5 scale
}

// Default values for new models
export const DEFAULT_MODEL_SETTINGS: Partial<ModelSettings> = {
  isEnabled: true,
  isDefault: false,
  temperature: 0.3,
  features: {
    speed: 3,
    dutch: 3,
    contextUnderstanding: 3,
  }
};

// UI Display helpers
export const RATING_TO_EMOJI = {
  speed: (rating: number) => '⚡'.repeat(rating),
  dutch: (rating: number) => '⭐'.repeat(rating),
  contextUnderstanding: (rating: number) => '⭐'.repeat(rating),
} as const;

export const BADGE_COLOR_OPTIONS = [
  { value: 'bg-blue-500', label: 'Blue' },
  { value: 'bg-purple-500', label: 'Purple' },
  { value: 'bg-green-500', label: 'Green' },
  { value: 'bg-red-500', label: 'Red' },
  { value: 'bg-yellow-500', label: 'Yellow' },
  { value: 'bg-gray-500', label: 'Gray' },
] as const;

export const MODEL_FEATURE_LABELS = {
  speed: 'Response Speed',
  dutch: 'Dutch Language Quality',
  contextUnderstanding: 'Context Retention'
} as const;

export const MODEL_TOOLTIPS = {
  speed: 'How quickly the model responds',
  dutch: 'Quality of Dutch language and grammar',
  contextUnderstanding: 'How well the model remembers context from earlier messages'
} as const;

// Form validation schemas
export const MODEL_SETTINGS_VALIDATION = {
  displayName: {
    required: 'Name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 50, message: 'Name must be at most 50 characters' }
  },
  modelTag: {
    required: 'Model tag is required',
    pattern: {
      value: /^[a-zA-Z0-9-_]+:[a-zA-Z0-9-_.]+$/,
      message: 'Model tag must be in the format "name:version"'
    }
  },
  temperature: {
    min: { value: 0, message: 'Minimum temperature is 0' },
    max: { value: 1, message: 'Maximum temperature is 1' }
  },
  maxTokens: {
    min: { value: 256, message: 'Minimum tokens is 256' },
    max: { value: 32768, message: 'Maximum tokens is 32768' }
  }
} as const;

// Admin UI Configuration
export const ADMIN_UI_CONFIG = {
  modelSelector: {
    title: 'AI Model Management',
    description: 'Manage available AI models and their settings.',
    helpText: 'Configure which models are available for chat sessions.'
  },
  modelForm: {
    sections: {
      basic: {
        title: 'Basic Settings',
        description: 'General model configuration'
      },
      advanced: {
        title: 'Advanced Settings',
        description: 'Technical model parameters'
      },
      features: {
        title: 'Model Attributes',
        description: 'Evaluate the performance of the model'
      }
    },
    buttons: {
      save: 'Save Settings',
      test: 'Test Model',
      enable: 'Enable Model',
      disable: 'Disable Model',
      delete: 'Delete Model'
    }
  },
  featureEditor: {
    title: 'Performance Ratings',
    description: 'Rate each aspect of the model',
    scale: {
      1: 'Very Poor',
      2: 'Poor',
      3: 'Average',
      4: 'Good',
      5: 'Excellent'
    }
  }
} as const;

// Helper types for type-safety in the UI
export type ModelFeature = keyof typeof MODEL_FEATURE_LABELS;
export type BadgeColor = typeof BADGE_COLOR_OPTIONS[number]['value'];

// Database table name
export const MODEL_SETTINGS_TABLE = 'model_settings' as const;
