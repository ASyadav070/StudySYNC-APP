import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// THIS IS THE FIX: We are using the exact model name from your working Java code.
const MODEL_NAME = 'gemini-2.5-flash-preview-05-20';

// ======================================================================
// === HELPER FUNCTIONS (Sleep & Retry)
// ======================================================================
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Calls the Gemini API with exponential backoff for rate limiting.
 * @param {object} model - The GenerativeModel instance
 * @param {string} prompt - The prompt to send
 * @returns {Promise<any>} - The successful response object
 */
async function generateContentWithRetry(model, prompt) {
  let retries = 0;
  // Start with a 60-second wait to respect the free tier
  let delay = 60000;
  const maxRetries = 3;

  while (retries < maxRetries) {
    try {
      // Try to generate the content
      const result = await model.generateContent(prompt);
      return result; // Success! Return the result.
    } catch (error) {
      // Check if this is a rate limit error (429)
      // We check error.status (for fetch errors) or error.httpStatus (if wrapped)
      const status = error.status || (error.cause && error.cause.httpStatus);

      if (status === 429) {
        retries++;
        if (retries >= maxRetries) {
          console.error('Max retries reached. Failing permanently.');
          throw error; // Throw the error after all retries fail
        }
        console.warn(`[429] Rate limit hit. Retrying in ${delay / 1000} seconds... (Attempt ${retries}/${maxRetries})`);
        await sleep(delay);
        delay *= 2; // Double the delay for the next attempt (exponential backoff)
      } else {
        // It was a different error (e.g., 400, 500), so fail immediately
        throw error;
      }
    }
  }
}

// ======================================================================
// === NEW: The "One Big Call" Function
// ======================================================================
/**
 * Generates all AI content (summary, keywords, flashcards) in a single API call.
 * @param {string} rawText - The extracted text from the document
 * @returns {Promise<object>} - An object containing { summary, keywords, flashcards }
 */
export async function generateAiContent(rawText) {
  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    // This is a single, complex prompt asking for a structured JSON response.
    const prompt = `You are an expert educational assistant. Analyze the following study material and generate a complete study package.

Text to analyze:
${rawText}

---

Provide your response as a single, valid JSON object. Do NOT include any text outside of the JSON object.
The JSON object must have the following exact structure:
{
  "summary": "A comprehensive summary (200-400 words) of the main topics, key concepts, and important details.",
  "keywords": [
    "keyword1",
    "keyword2",
    "keyword3"
  ],
  "flashcards": [
    {
      "question": "A clear, concise question from the text.",
      "answer": "A clear, concise answer to the question."
    },
    {
      "question": "Another question...",
      "answer": "Another answer..."
    }
  ]
}

- The 'summary' must be a string.
- The 'keywords' must be an array of 5-15 strings.
- The 'flashcards' must be an array of 5-10 objects, each with a 'question' and 'answer' string.

Return ONLY the valid JSON object:`;

    // === Use the retry function ONCE ===
    const result = await generateContentWithRetry(model, prompt);
    const response = await result.response;
    let jsonText = response.text();

    // Clean up the response (remove markdown code blocks if present)
    jsonText = jsonText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse the JSON to ensure it's valid and return the object
    const aiData = JSON.parse(jsonText);

    // Validate the structure
    if (!aiData.summary || !Array.isArray(aiData.keywords) || !Array.isArray(aiData.flashcards)) {
      throw new Error('AI returned invalid JSON structure.');
    }

    return aiData;
  } catch (error) {
    console.error('Error generating all AI content:', error);
    throw new Error('Failed to generate AI content');
  }
}

