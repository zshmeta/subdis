// src/utils/embed.js
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

const ffmpeg = createFFmpeg({ log: true });

// Function to convert VTT to SRT
const convertVTTtoSRT = (vttContent) => {
  let srtContent = vttContent;

  // Remove WEBVTT header if present
  srtContent = srtContent.replace(/WEBVTT\s*\n/g, '');

  // Replace timestamps format
  srtContent = srtContent.replace(
    /(\d{2}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2}):(\d{2}):(\d{2})\.(\d{3})/g,
    (match, h1, m1, s1, ms1, h2, m2, s2, ms2) => {
      return `${h1}:${m1}:${s1},${ms1} --> ${h2}:${m2}:${s2},${ms2}`;
    }
  );

  // Remove any STYLE blocks or metadata
  srtContent = srtContent.replace(/^(STYLE[\s\S]*?)(?=\d+\n|\n\n)/gm, '');

  // Number the subtitles properly
  let counter = 1;
  srtContent = srtContent.replace(/^(\d+)?$/gm, () => `${counter++}`);

  return srtContent;
};

export const embedSubtitles = async (videoFile, subtitleUrl, style) => {
  // Check if FFmpeg is loaded
  if (!ffmpeg.loaded) {
    await ffmpeg.load();
  }

  try {
    // Fetch subtitle file
    const response = await fetch(subtitleUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch subtitle file');
    }
    let subtitleContent = await response.text();

    // Convert VTT to SRT
    const srtContent = convertVTTtoSRT(subtitleContent);

    // Create a Uint8Array from the SRT content
    const encoder = new TextEncoder();
    const subtitleUint8Array = encoder.encode(srtContent);

    // Write files to FFmpeg FS
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoFile));
    ffmpeg.FS('writeFile', 'subtitles.srt', subtitleUint8Array);

    // Embed subtitles
    await ffmpeg.run(
      '-i', 'input.mp4',
      '-i', 'subtitles.srt',
      '-c:v', 'copy',
      '-c:a', 'copy',
      '-c:s', 'mov_text',
      'output.mp4'
    );

    // Read the result
    const data = ffmpeg.FS('readFile', 'output.mp4');

    // Create a Blob from the output
    const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });

    return videoBlob;
  } catch (error) {
    console.error('Error embedding subtitles:', error);
    throw error;
  }
};
