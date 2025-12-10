import { NextRequest, NextResponse } from 'next/server';

// --- Configuration for Google Gemini API ---
const GEMINI_API_MODEL = 'gemini-2.5-flash-preview-09-2025';
const GEMINI_API_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_API_MODEL}:generateContent`;

// Exponential backoff configuration
const MAX_RETRIES = 5;
const INITIAL_DELAY_MS = 1000; // 1 second

/**
 * POST /api/grammar
 *
 * Expects JSON body:
 * {
 *   "text": "some selected text to improve"
 * }
 *
 * Returns:
 * {
 *   "improvedText": "text with better grammar, clarity, and neutral/professional tone"
 * }
 */
export async function POST(request: NextRequest) {
  // 1. Input Validation and Parsing
  let text: string;
  try {
    const body = await request.json();
    text = body.text?.trim();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing text field in request body.' },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body format.' },
      { status: 400 },
    );
  }

  // Ensure the API Key is available
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY environment variable is not set.');
    return NextResponse.json(
      { error: 'Server configuration error: GEMINI API Key missing.' },
      { status: 500 },
    );
  }

  const geminiApiUrl = `${GEMINI_API_BASE_URL}?key=${apiKey}`;

  // 2. Prepare payload for Gemini API
  const payload = {
    systemInstruction: {
      parts: [
        {
          text: [
            'You are an expert English writing assistant.',
            'Improve the user’s text for grammar, spelling, clarity, and a neutral/professional tone.',
            'Preserve the original meaning and keep the length roughly similar.',
            'Return ONLY the improved text as plain text, with no explanations, no JSON, no extra commentary.',
          ].join(' '),
        },
      ],
    },
    contents: [{ parts: [{ text }] }],
    // tools: [{ google_search: {} }], // Not needed here, but you can re-enable if you want
    generationConfig: {
      temperature: 0.1,
    },
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

      // For non-retryable client errors (except 429), fail fast
      if (res.status >= 400 && res.status < 500 && res.status !== 429) {
        const errorText = await res.text();
        console.error(
          `Gemini Grammar API error. Status: ${res.status}. Response: ${errorText}`,
        );
        return NextResponse.json(
          {
            error: `Upstream grammar service failed. (Gemini Status: ${res.status}): ${errorText.substring(
              0,
              100,
            )}...`,
          },
          { status: 502 },
        );
      }

      // Retry for 429 or 5xx
      const delay =
        INITIAL_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.error(
        `Attempt ${attempt + 1} to call Gemini Grammar API failed due to network error:`,
        error,
      );
      if (attempt < MAX_RETRIES - 1) {
        const delay =
          INITIAL_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  if (!res || !res.ok) {
    if (!res) {
      return NextResponse.json(
        {
          error:
            'All attempts to reach Gemini Grammar API failed due to network issues.',
        },
        { status: 500 },
      );
    }
    const errorText = await res.text();
    console.error(
      `Gemini Grammar API failed after retries. Status: ${res.status}. Response: ${errorText}`,
    );
    return NextResponse.json(
      {
        error: `Grammar service failed after all retries. (Gemini Status: ${res.status})`,
      },
      { status: 502 },
    );
  }

  // 4. Process successful response
  try {
    const data = await res.json();
    const improvedText: string | undefined =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!improvedText) {
      console.warn(
        'Gemini Grammar API returned empty or unexpected format:',
        data,
      );
      return NextResponse.json(
        {
          error:
            'Grammar service returned empty or unexpected result. Please try again.',
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ improvedText });
  } catch (error) {
    console.error('Error parsing Gemini Grammar response:', error);
    return NextResponse.json(
      { error: 'Internal server error processing grammar API response.' },
      { status: 500 },
    );
  }
}
