import path from 'path';
import os from 'os';
import axios from 'axios';
import fs from 'fs';
import {EventEmitter} from 'youtubei.js';
import Speaker from 'speaker';
import Volume from 'pcm-volume';
import Ffmpeg from 'fluent-ffmpeg';

export class PlaySession extends EventEmitter {
  url: string;
  speaker: Speaker;
  volume: Volume;

  constructor(audioUrl: string, speaker: Speaker, volume: Volume) {
    super();

    this.url = audioUrl;
    this.speaker = speaker;
    this.volume = volume;
  }

  async play() {
    const tempPath = path.join(os.tmpdir(), `temp-audio-file-${Date.now()}-${Math.round(Math.random() * 1E9)}.mp3`);
    const response = await axios({
      method: 'get',
      url: this.url,
      responseType: 'stream',
    });
    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);
    await new Promise((resolve: any, reject: any) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    this.volume.pipe(this.speaker);
    return Ffmpeg(tempPath)
      .format('s16le')
      .audioChannels(2)
      .audioFrequency(44100) // 44.1 kHz frequency
      .on('end', () => {
        fs.unlink(tempPath, (err) => {
          if (err) console.log('Error while trying to delete leftover track file');
        });
      }).pipe(this.volume);
  }
}
