require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/ask', async (req, res) => {
  const question = String(req.body?.question || '').trim();

  if (!question) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  if (!apiKey) {
    return res.status(500).json({
      error: 'OPENAI_API_KEY is not configured. Add it to your .env file.'
    });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: question }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message || 'Request failed.';
      return res.status(response.status).json({ error: message });
    }

    const answer = data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return res.status(500).json({ error: 'No answer returned.' });
    }

    return res.json({ answer });
  } catch (error) {
    console.error('OpenAI request failed:', error);
    return res.status(500).json({ error: 'Something went wrong while generating the response.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});
