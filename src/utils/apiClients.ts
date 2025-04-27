import { GoogleGenerativeAI } from '@google/generative-ai';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Model configuration with fallbacks
const GEMINI_MODELS = {
  PRIMARY: 'gemini-2.0-flash',
  FALLBACK_1: 'gemini-1.5-pro',
  FALLBACK_2: 'gemini-pro',
  FALLBACK_3: 'gemini-1.5-pro-latest',
};

// Verify API key and model access
export const verifyGeminiAccess = async () => {
  if (!GEMINI_API_KEY) {
    return {
      isValid: false,
      error: 'Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.'
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODELS.PRIMARY}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Test connection"
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `API verification failed: ${response.status} ${response.statusText}` +
        (errorData.error?.message ? ` - ${errorData.error.message}` : '')
      );
    }

    return {
      isValid: true,
      model: GEMINI_MODELS.PRIMARY
    };
  } catch (error: any) {
    console.error('Gemini API verification failed:', error);
    return {
      isValid: false,
      error: error.message || 'Failed to verify API access'
    };
  }
};

// Validate API keys
export const validateApiKeys = async () => {
  const errors: string[] = [];
  
  // Verify Gemini API access
  const geminiAccess = await verifyGeminiAccess();
  if (!geminiAccess.isValid) {
    errors.push(geminiAccess.error);
  }
  
  if (!OPENWEATHER_API_KEY) {
    errors.push('OpenWeather API key is missing. Please add VITE_OPENWEATHER_API_KEY to your .env file.');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    activeModel: geminiAccess.isValid ? geminiAccess.model : undefined
  };
};

// Initialize Gemini AI with validation and error handling
let genAIInstance: GoogleGenerativeAI | null = null;
let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const initializeGenAI = () => {
  if (!GEMINI_API_KEY) {
    throw new Error('Cannot initialize Gemini AI: API key is missing');
  }
  
  try {
    genAIInstance = new GoogleGenerativeAI(GEMINI_API_KEY);
    return genAIInstance;
  } catch (error) {
    console.error('Failed to initialize Gemini AI:', error);
    throw new Error('Failed to initialize Gemini AI client');
  }
};

export const getGenAI = () => {
  if (!genAIInstance) {
    return initializeGenAI();
  }
  return genAIInstance;
};

export const getGeminiModel = async () => {
  const genAI = getGenAI();
  retryCount = 0;
  
  const tryModelWithFallbacks = async (models: string[]): Promise<any> => {
    if (models.length === 0) {
      throw new Error('All model attempts failed. Please check your API key and model availability.');
    }

    const currentModel = models[0];
    const remainingModels = models.slice(1);

    try {
      console.log(`Attempting to initialize model: ${currentModel}`);
      return genAI.getGenerativeModel({
        model: currentModel,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
    } catch (error: any) {
      console.error(`Failed to initialize ${currentModel}:`, error);
      
      if (remainingModels.length > 0) {
        console.log(`Falling back to next model...`);
        await delay(RETRY_DELAY);
        return tryModelWithFallbacks(remainingModels);
      }
      
      throw error;
    }
  };

  const tryGetModel = async (): Promise<any> => {
    try {
      // Verify API access first
      const access = await verifyGeminiAccess();
      if (!access.isValid) {
        throw new Error(access.error);
      }

      // Try all models in sequence
      return await tryModelWithFallbacks([
        GEMINI_MODELS.PRIMARY,
        GEMINI_MODELS.FALLBACK_1,
        GEMINI_MODELS.FALLBACK_2,
        GEMINI_MODELS.FALLBACK_3,
      ]);
    } catch (error: any) {
      console.error('Error getting Gemini model:', error);
      
      if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`Retrying entire model sequence (attempt ${retryCount}/${MAX_RETRIES})...`);
        await delay(RETRY_DELAY * retryCount); // Exponential backoff
        return tryGetModel();
      }
      
      throw new Error(
        `Failed to initialize any Gemini model after ${MAX_RETRIES} attempts. ` +
        `Please check your API key and ensure you have access to Gemini models. ` +
        `Error: ${error.message || 'Unknown error'}`
      );
    }
  };
  
  return tryGetModel();
};

// OpenWeather API client with improved error handling
export const weatherApi = {
  getCurrentWeather: async (lat: number, lon: number) => {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not configured in environment variables');
    }
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch weather data: ${response.status} ${response.statusText}` +
          (errorData.message ? ` - ${errorData.message}` : '')
        );
      }
      
      return response.json();
    } catch (error) {
      console.error('Weather API error:', error);
      throw error;
    }
  },
  
  getWeatherAlerts: async (lat: number, lon: number) => {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key is not configured in environment variables');
    }
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${OPENWEATHER_API_KEY}`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Failed to fetch weather alerts: ${response.status} ${response.statusText}` +
          (errorData.message ? ` - ${errorData.message}` : '')
        );
      }
      
      return response.json();
    } catch (error) {
      console.error('Weather Alerts API error:', error);
      throw error;
    }
  }
};