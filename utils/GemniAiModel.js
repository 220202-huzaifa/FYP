/*
 * Install the Generative AI SDK
 *
 * $ npm install @google/generative-ai
 *
 * See the getting started guide for more information
 * https://ai.google.dev/gemini-api/docs/get-started/node
 */

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai'

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

if (!apiKey) {
  // Fail fast with a clear message if the API key is missing
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set')
}

const genAI = new GoogleGenerativeAI(apiKey)

const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash', // Using stable model with better token handling
})

const generationConfig = {
  temperature: 1.2, // Slightly reduced for stability
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 2048, // Reduced to prevent token limit issues
  responseMimeType: 'text/plain',
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const sendMessageWithRetry = async (
  prompt,
  { retries = 2, backoffMs = 1200 } = {},
) => {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Create a new chat session for each request to avoid repetition
      const chatSession = model.startChat({
        generationConfig,
        // safetySettings: Adjust safety settings
        // See https://ai.google.dev/gemini-api/docs/safety-settings
      })
      return await chatSession.sendMessage(prompt)
    } catch (error) {
      lastError = error
      const status = error?.response?.status
      const isRetryable = status === 429 || status === 503
      if (!isRetryable || attempt === retries) {
        throw error
      }
      await wait(backoffMs * (attempt + 1))
    }
  }
  throw lastError
}
