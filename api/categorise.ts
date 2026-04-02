import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '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';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { merchant } = req.body;
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLAUDE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [{
          role: 'user',
          content: `Categorize this merchant "${merchant}" into one of: food, transport, shopping, utilities, entertainment, health, transfer, income, other. Reply with ONLY the category word.`
        }]
      })
    });
    
    if (!response.ok) {
         throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    const category = data.choices[0].message.content.trim().toLowerCase();
    
    res.status(200).json({ category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

