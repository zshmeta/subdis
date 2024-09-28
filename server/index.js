// server.js
import express from 'express';
import multer from 'multer';
import whispapi from 'whispapi';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import process from 'process';

const app = express();

// Ensure 'uploads' directory exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

app.post('/api/transcribe', upload.single('audio_file'), async (req, res) => {
  const file = req.file;

  console.log('Received file:', file);

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const filePath = path.resolve(file.path);
    console.log('File path:', filePath);
    const format = 'json';

    const transcription = await whispapi(filePath, format);

    // Optionally, clean up uploaded file after processing
    fs.unlinkSync(filePath);

    res.json(transcription);
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
