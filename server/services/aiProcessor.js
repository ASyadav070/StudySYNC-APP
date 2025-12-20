import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ======================================================================
// === TWO-MODEL STRATEGY (Optimized for Free Tier)
// ======================================================================
// Quota-optimized architecture to avoid rate limits:
//
// 📝 textModel (gemini-2.5-flash-lite) 
//    - Use: ALL text tasks (summaries, flashcards, mind maps, chat)
//    - Quota: ~1,500 RPD (requests per day) - HIGH CAPACITY
//    - Speed: Fast, efficient, perfect for text-only workloads
//
// 👁️ visionModel (gemini-2.5-flash)
//    - Use: Image analysis ONLY (whiteboards, diagrams)
//    - Quota: ~20 RPD - EXTREMELY LIMITED
//    - WARNING: Use sparingly! No fallback available.
//
// NOTE: gemini-1.5-flash is DEPRECATED. All text tasks now use flash-lite.
// ======================================================================

const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
const visionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
 * Uses the textModel (gemini-2.5-flash-lite) for text generation.
 * @param {string} rawText - The extracted text from the document
 * @returns {Promise<object>} - An object containing { summary, keywords, flashcards }
 */
export async function generateAiContent(rawText) {
  try {
    // Use the textModel for text generation tasks
    const model = textModel;

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
    // Propagate 429 errors specifically
    if (error.status === 429 || (error.cause && error.cause.httpStatus === 429)) {
      const rateLimitError = new Error('Daily AI limit reached. Please try again tomorrow.');
      rateLimitError.status = 429;
      throw rateLimitError;
    }
    throw new Error('Failed to generate AI content');
  }
}

// ======================================================================
// === Vision Function for Whiteboard Image Analysis (No Fallback)
// ======================================================================
/**
 * Analyzes a whiteboard image and extracts text/concepts from it.
 * Uses the visionModel (gemini-2.5-flash) - LIMITED to ~20 RPD.
 * WARNING: No fallback available. If quota is exhausted, returns friendly error.
 * @param {Buffer} imageBuffer - The image data as a buffer
 * @param {string} mimeType - The MIME type of the image (e.g., 'image/png', 'image/jpeg')
 * @returns {Promise<object>} - An object containing { text, summary, concepts }
 */
export async function analyzeWhiteboardImage(imageBuffer, mimeType) {
  // Convert buffer to base64
  const base64Image = imageBuffer.toString('base64');
  
  const prompt = `Analyze this whiteboard/diagram image. Extract all visible text, identify key concepts, and provide a concise summary.

Output format (JSON only, no markdown):
{
  "text": "all readable text",
  "summary": "brief concept summary",
  "concepts": ["concept1", "concept2", "concept3"]
}`;

  // Prepare the image part for Gemini
  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType
    }
  };

  try {
    console.log('[Vision] Attempting with gemini-2.5-flash (~20 RPD quota)');
    const result = await generateContentWithRetry(visionModel, [prompt, imagePart]);
    const response = await result.response;
    let jsonText = response.text();

    // Clean up the response
    jsonText = jsonText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Parse and validate
    const aiData = JSON.parse(jsonText);

    if (!aiData.text || !aiData.summary || !Array.isArray(aiData.concepts)) {
      throw new Error('AI returned invalid JSON structure for image analysis.');
    }

    console.log('[Vision] ✓ Success with visionModel');
    return aiData;
    
  } catch (visionError) {
    console.error('[Vision] visionModel failed:', visionError.message);
    
    // Check if it's a 429 (quota exceeded) error
    const is429 = visionError.status === 429 || 
                  (visionError.cause && visionError.cause.httpStatus === 429);
    
    if (is429) {
      console.log('[Vision] ⚠️ Daily vision quota reached (20 RPD limit)');
      // Return friendly error - no fallback available for images
      const quotaError = new Error('Daily vision quota reached. Please try text analysis instead or wait 24 hours for quota reset.');
      quotaError.status = 429;
      throw quotaError;
    }
    
    // For other errors, propagate
    throw new Error('Failed to analyze whiteboard image: ' + visionError.message);
  }
}

// ======================================================================
// === Mind Map Generation Function
// ======================================================================
/**
 * Generates a Mermaid.js mindmap diagram from a text summary.
 * Uses the textModel (gemini-2.5-flash-lite) - high quota, smart enough for structured output.
 * @param {string} summaryText - The text summary to convert to a mindmap
 * @returns {Promise<string>} - The Mermaid.js mindmap syntax
 */
export async function generateMindMap(summaryText) {
  try {
    // Use the textModel (flash-lite is perfectly capable of generating structured Mermaid syntax)
    const model = textModel;

    const prompt = `You are a coding assistant specializing in diagram generation. Convert the following text summary into Mermaid.js mindmap syntax.

Summary:
${summaryText}

CRITICAL RULES:
1. Start with "mindmap" keyword on the first line
2. Use root((Main Topic)) for the main concept
3. Create 3-6 main branches with hierarchical subconcepts
4. Use proper indentation (2 spaces per level)
5. Be concise - avoid verbose labels
6. Return ONLY the raw Mermaid syntax
7. NO markdown code blocks, NO explanations, NO extra text
8. NEVER use backticks, brackets, parentheses, or special characters in node text
9. Replace code syntax like 'dp[W + 1]' with plain text like 'DP Array'
10. Keep node labels simple and descriptive without technical symbols
11. Use only alphanumeric characters, spaces, and basic punctuation (.,-)

Example format:
mindmap
  root((Main Topic))
    Concept 1
      Detail A
      Detail B
    Concept 2
      Detail C

Output the Mermaid code now:`;

    const result = await generateContentWithRetry(model, prompt);
    const response = await result.response;
    let mermaidCode = response.text();

    // Clean up the response - remove markdown code blocks if present
    mermaidCode = mermaidCode
      .replace(/```mermaid\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Validate that it starts with 'mindmap'
    if (!mermaidCode.toLowerCase().startsWith('mindmap')) {
      throw new Error('AI did not return valid Mermaid mindmap syntax.');
    }

    return mermaidCode;
  } catch (error) {
    console.error('Error generating mind map:', error);
    // Propagate 429 errors specifically
    if (error.status === 429 || (error.cause && error.cause.httpStatus === 429)) {
      const rateLimitError = new Error('Daily AI limit reached. Please try again tomorrow.');
      rateLimitError.status = 429;
      throw rateLimitError;
    }
    throw new Error('Failed to generate mind map');
  }
}
