// Vercel serverless function to proxy Anthropic API calls
// This keeps your API key secure server-side and never exposes it to the browser

export default async function handler(req, res) {
  // Security: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Get API key from environment variable (never exposed to client)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('Missing ANTHROPIC_API_KEY environment variable');
    return res.status(500).json({ 
      error: 'Server configuration error: Missing API key' 
    });
  }

  // Security: Basic request validation
  if (!req.body || !req.body.messages) {
    return res.status(400).json({ 
      error: 'Invalid request: Missing required fields' 
    });
  }

  try {
    // Make the request to Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,  // API key only used server-side
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    // Return error responses as-is
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    // Security: Never log the API key
    // Security: Don't include the API key in any response
    return res.status(200).json(data);
  } catch (error) {
    console.error('API Error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to process request',
      message: error.message 
    });
  }
}
