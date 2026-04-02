import { AudioPlayer, createAudioPlayer } from "expo-audio";

class SoundService {
  private beep: AudioPlayer | null = null;

  async init() {
    if (this.beep) return;

    this.beep = createAudioPlayer(
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("../../assets/audio/wood_plank_flicks.ogg"),
    );
  }

  playBeep() {
    if (!this.beep) return;

    try {
      this.beep.seekTo(0);
      this.beep.play();
    } catch {}
  }

  dispose() {
    if (this.beep) {
      this.beep.remove();
      this.beep = null;
    }
  }
}

export const soundService = new SoundService();
