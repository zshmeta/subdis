import express from 'express';
import { translate } from 'google-translate-api-x';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.post('/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;
  try {
    const response = await translate(text, { to: targetLanguage, client: 'gtx' });
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});