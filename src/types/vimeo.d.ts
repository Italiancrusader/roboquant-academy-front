
interface VimeoPlayerOptions {
  id?: number;
  url?: string;
  autopause?: boolean;
  autoplay?: boolean;
  background?: boolean;
  byline?: boolean;
  color?: string;
  controls?: boolean;
  dnt?: boolean;
  height?: number;
  loop?: boolean;
  maxheight?: number;
  maxwidth?: number;
  muted?: boolean;
  playsinline?: boolean;
  portrait?: boolean;
  responsive?: boolean;
  speed?: boolean;
  title?: boolean;
  transparent?: boolean;
  width?: number;
}

interface VimeoPlayer {
  destroy: () => void;
  disableTextTrack: () => void;
  enableTextTrack: (language: string, kind?: string) => void;
  getAutopause: () => Promise<boolean>;
  getChapters: () => Promise<any[]>;
  getColor: () => Promise<string>;
  getCuePoints: () => Promise<any[]>;
  getCurrentTime: () => Promise<number>;
  getDuration: () => Promise<number>;
  getEnded: () => Promise<boolean>;
  getLoop: () => Promise<boolean>;
  getMuted: () => Promise<boolean>;
  getPaused: () => Promise<boolean>;
  getPlayed: () => Promise<any[]>;
  getPlaybackRate: () => Promise<number>;
  getSeekable: () => Promise<any[]>;
  getTextTracks: () => Promise<any[]>;
  getVideoEmbedCode: () => Promise<string>;
  getVideoId: () => Promise<string>;
  getVideoTitle: () => Promise<string>;
  getVideoWidth: () => Promise<number>;
  getVideoHeight: () => Promise<number>;
  getVolume: () => Promise<number>;
  pause: () => Promise<void>;
  play: () => Promise<void>;
  ready: () => Promise<void>;
  setAutopause: (autopause: boolean) => Promise<void>;
  setColor: (color: string) => Promise<void>;
  setCurrentTime: (time: number) => Promise<number>;
  setLoop: (loop: boolean) => Promise<void>;
  setMuted: (muted: boolean) => Promise<void>;
  setPlaybackRate: (playbackRate: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  unload: () => Promise<void>;
  on: (event: string, callback: (data?: any) => void) => void;
  off: (event: string, callback?: (data?: any) => void) => void;
}

interface VimeoPlayerConstructor {
  new (element: HTMLIFrameElement | HTMLElement | string, options?: VimeoPlayerOptions): VimeoPlayer;
}

interface Window {
  Vimeo?: {
    Player: VimeoPlayerConstructor;
  };
}
