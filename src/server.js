// src/server.js
import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import translate from 'google-translate-api-x';

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json()); 

// Ensure the 'outputs' directory exists
const outputsDir = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir);
}

// Helper function to determine output container
const getOutputContainer = (format) => {
  if (format === 'ass') {
    return 'mkv'; // Use MKV for ASS to support advanced styling
  }
  return 'mp4'; // Use MP4 for SRT and VTT
};

// Endpoint for embedding subtitles (Soft Subtitles)
app.post('/embed-subtitles', upload.fields([{ name: 'video' }, { name: 'subtitles' }, { name: 'format' }, { name: 'style' }]), (req, res) => {
  const videoFile = req.files.video && req.files.video[0];
  const subtitleFile = req.files.subtitles && req.files.subtitles[0];
  const subtitleFormat = req.body.format || 'srt'; // 'srt', 'vtt', or 'ass'
  const subtitleStyle = req.body.style || 'default'; // Style selection

  if (!videoFile || !subtitleFile) {
    return res.status(400).send('Video and subtitle files are required.');
  }

  // Determine output container based on subtitle format
  const container = getOutputContainer(subtitleFormat);
  const outputFilename = `output_${Date.now()}.${container}`;
  const outputPath = path.join(outputsDir, outputFilename);

  console.log('Received Video File:', videoFile.path);
  console.log('Received Subtitle File:', subtitleFile.path);
  console.log('Subtitle Format:', subtitleFormat);
  console.log('Subtitle Style:', subtitleStyle);
  console.log('Output Path:', outputPath);

  const command = ffmpeg();

  // Add video and subtitle inputs
  command
    .addInput(videoFile.path)
    .addInput(subtitleFile.path);

  // Set output options based on subtitle format
  const outputOptions = ['-c:v copy', '-c:a copy'];

  if (subtitleFormat === 'ass') {
    outputOptions.push('-c:s ass'); // Use ASS codec for MKV container
  } else if (subtitleFormat === 'vtt') {
    outputOptions.push('-c:s mov_text'); // Use mov_text codec for VTT in MP4
  } else { // 'srt' or default
    outputOptions.push('-c:s mov_text'); // Use mov_text codec for SRT in MP4
  }

  command.outputOptions(outputOptions)
    .on('start', (cmdLine) => {
      console.log('Spawned FFmpeg with command:', cmdLine);
    })
    .on('progress', (progress) => {
      console.log(`Processing: ${progress.percent ? progress.percent.toFixed(2) : '0.00'}% done`);
    })
    .on('end', () => {
      console.log('FFmpeg processing finished successfully.');
      res.download(outputPath, `video_with_subtitles.${container}`, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          return res.status(500).send('Error downloading the file.');
        }
        // Clean up files after successful download
        fs.unlink(videoFile.path, (err) => {
          if (err) console.error('Error deleting video file:', err);
        });
        fs.unlink(subtitleFile.path, (err) => {
          if (err) console.error('Error deleting subtitle file:', err);
        });
        fs.unlink(outputPath, (err) => {
          if (err) console.error('Error deleting output file:', err);
        });
      });
    })
    .on('error', (err, stdout, stderr) => {
      console.error('FFmpeg error:', err.message);
      console.error('FFmpeg stderr:', stderr);
      res.status(500).send('Failed to embed subtitles.');
    })
    .save(outputPath);
});

// Endpoint for burning-in subtitles (Hard Subtitles)// Endpoint for burning-in subtitles (Hard Subtitles)
// Endpoint for burning-in subtitles (Hard Subtitles)
app.post('/burn-subtitles', upload.fields([{ name: 'video' }, { name: 'subtitles' }]), (req, res) => {
  const videoFile = req.files.video && req.files.video[0];
  const subtitleFile = req.files.subtitles && req.files.subtitles[0];

  if (!videoFile || !subtitleFile) {
    return res.status(400).send('Video and subtitle files are required.');
  }

  // Determine output container based on input video
  const originalVideoFilename = videoFile.originalname || 'output.mp4';
  const dotIndex = originalVideoFilename.lastIndexOf('.');
  const baseName = dotIndex !== -1 ? originalVideoFilename.substring(0, dotIndex) : originalVideoFilename;
  const extension = dotIndex !== -1 ? originalVideoFilename.substring(dotIndex) : '.mp4';
  const outputFilename = `${baseName}-subdis${extension}`;
  const outputPath = path.join(outputsDir, outputFilename);

  const command = ffmpeg();

  // Add video input
  command.input(videoFile.path);

  // Use the 'ass' filter to burn subtitles
  const vfOption = `ass=${subtitleFile.path}`;

  // Set output options
  command
    .videoFilters(vfOption)
    .outputOptions('-c:a copy')
    .on('start', (cmdLine) => {
      console.log('Spawned FFmpeg with command:', cmdLine);
    })
    .on('progress', (progress) => {
      console.log(`Processing: ${progress.percent ? progress.percent.toFixed(2) : '0.00'}% done`);
    })
    .on('end', () => {
      console.log('FFmpeg processing finished successfully.');
      res.download(outputPath, outputFilename, (err) => {
        if (err) {
          console.error('Error sending file:', err);
          return res.status(500).send('Error downloading the file.');
        }
        // Clean up files after successful download
        fs.unlink(videoFile.path, (err) => {
          if (err) console.error('Error deleting video file:', err);
        });
        fs.unlink(subtitleFile.path, (err) => {
          if (err) console.error('Error deleting subtitle file:', err);
        });
        fs.unlink(outputPath, (err) => {
          if (err) console.error('Error deleting output file:', err);
        });
      });
    })
    .on('error', (err, stdout, stderr) => {
      console.error('FFmpeg error:', err.message);
      console.error('FFmpeg stderr:', stderr);
      res.status(500).send('Failed to burn subtitles.');
    })
    .save(outputPath);
});

// Endpoint for translation
app.post('/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) {
    return res
      .status(400)
      .json({ error: 'Text and targetLanguage are required.' });
  }

  try {
    const result = await translate(text, { to: targetLanguage });
    res.json({ text: result.text });
  } catch (error) {
    console.error('Translation Error:', error);
    res
      .status(500)
      .json({ error: 'Translation failed. Please try again later.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
