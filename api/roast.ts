import type { VercelRequest, VercelResponse } from '@vercel/node';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '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';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tone, transactions } = req.body;
    
    let systemPrompt = '';
    if (tone === 'desi_parent') {
      systemPrompt = "You are a strict, caring, emotional Desi Indian Parent. Roast the user's spending habits using guilt trips and Hinglish.";
    } else if (tone === 'honest_bro') {
      systemPrompt = "You are a blunt, casual best friend bro. Roast the user's spending habits using modern slang and Hinglish.";
    } else {
      systemPrompt = "You are a motivating, tough-love financial coach. Roast their bad habits with data-driven points.";
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLAUDE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Here are my recent transactions: ${JSON.stringify(transactions)}. Please roast my spending.` }
        ]
      })
    });
    
    if (!response.ok) {
         throw new Error(`OpenRouter API error: ${response.status}`);
    }
    
    const data = await response.json();
    const roastText = data.choices[0].message.content.trim();
    
    res.status(200).json({ roast: roastText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

