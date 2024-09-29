// src/utils/embed.js
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg({ log: true });

export const embedSubtitles = async (videoFile, subtitleUrl, style) => {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  try {
    // Fetch subtitle file
    const response = await fetch(subtitleUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch subtitle file');
    }
    let subtitleContent = await response.text();

    // Inject basic CSS styles based on selected style
    let styleCSS = '';
    switch (style) {
      case 'white':
        styleCSS = 'color:white; font-size:20px; text-shadow: 2px 2px 4px #000;';
        break;
      case 'black':
        styleCSS = 'color:black; font-size:20px; text-shadow: 2px 2px 4px #fff;';
        break;
      case 'yellow':
        styleCSS = 'color:yellow; font-size:20px; text-shadow: 2px 2px 4px #000;';
        break;
      default:
        styleCSS = 'color:white; font-size:16px;';
    }

    // Add a <style> tag at the beginning of the .vtt file
    subtitleContent = `STYLE\n::cue {\n  ${styleCSS}\n}\n\n` + subtitleContent;

    const subtitleBlob = new Blob([subtitleContent], { type: 'text/vtt' });
    const subtitleArrayBuffer = await subtitleBlob.arrayBuffer();
    const subtitleUint8Array = new Uint8Array(subtitleArrayBuffer);

    // Write files to FFmpeg FS
    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoFile));
    ffmpeg.FS('writeFile', 'subtitles.vtt', subtitleUint8Array);

    // Embed subtitles
    await ffmpeg.run('-i', 'input.mp4', '-vf', `subtitles=subtitles.vtt`, '-c:a', 'copy', 'output.mp4');

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
