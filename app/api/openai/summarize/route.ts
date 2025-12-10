// import { NextRequest, NextResponse } from 'next/server';

// // --- Configuration for Google Gemini API ---
// const GEMINI_API_MODEL = 'gemini-2.5-flash-preview-09-2025';
// const GEMINI_API_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_API_MODEL}:generateContent`;

// /**
//  * Handles POST requests to the 
// zation API route using the Google Gemini API.
//  * Expects a JSON body with a 'text' property containing the text to summarize.
//  * * NOTE: This route now requires the GEMINI_API_KEY environment variable to be set.
//  * * @param request The incoming NextRequest object.
//  * @returns A NextResponse containing the summary or an error message.
//  */
// export async function POST(request: NextRequest) {









import { NextRequest, NextResponse } from 'next/server';

// --- Configuration for Google Gemini API ---
const GEMINI_API_MODEL = 'gemini-2.5-flash-preview-09-2025';
const GEMINI_API_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_API_MODEL}:generateContent`;

// Exponential backoff configuration
const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 1000; // 1 second

export async function POST(request: NextRequest) {
  // 1. Input Validation and Parsing
  let text: string;
  try {
    const body = await request.json();
    text = body.text?.trim();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing text field in request body.' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body format.' }, { status: 400 });
  }

  // Ensure the API Key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable is not set.");
    return NextResponse.json({ error: 'Server configuration error: GEMINI API Key missing.' }, { status: 500 });
  }

  const geminiApiUrl = `${GEMINI_API_BASE_URL}?key=${apiKey}`;

  // 2. Prepare payload for Gemini API
  const payload = {
    systemInstruction: {
  parts: [{
    text: "You are an expert summarization bot. Summarize the user's text into a concise, multi-sentence paragraph (minimum 2 lines, maximum 10 lines), capturing the main points of the document according to its length."
  }]
}
,
    contents: [{ parts: [{ text: text }] }],
    tools: [{ "google_search": {} }],
    generationConfig: {
      temperature: 0.1,
    }
  };

  // 3. Call Google Gemini API with retries
  let res: Response | undefined;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      res = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        break; // success
      }

      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        const errorText = await res.text();
        console.error(`Gemini API error. Status: ${res.status}. Response: ${errorText}`);
        return NextResponse.json({ 
          error: `Upstream summarization service failed. (Gemini Status: ${res.status}): ${errorText.substring(0, 100)}...` 
        }, { status: 502 });
      }

      // Retry for 429 or 5xx
      const delay = INITIAL_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed due to network error:`, error);
      if (attempt < MAX_RETRIES - 1) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  if (!res || !res.ok) {
    if (!res) {
      return NextResponse.json({ error: 'All attempts to reach Gemini API failed due to network issues.' }, { status: 500 });
    }
    const errorText = await res.text();
    console.error(`Gemini API failed after retries. Status: ${res.status}. Response: ${errorText}`);
    return NextResponse.json({ error: `Summarization service failed after all retries. (Gemini Status: ${res.status})` }, { status: 502 });
  }

  // 4. Process successful response
  try {
    const data = await res.json();
    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!summary) {
      console.warn('Gemini API returned empty or unexpected format:', data);
      return NextResponse.json({ error: 'Summary service returned empty or unexpected result.' }, { status: 500 });
    }

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return NextResponse.json({ error: 'Internal server error processing API response.' }, { status: 500 });
  }
}
