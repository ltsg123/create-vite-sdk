declare module "rollup-plugin-glsl";

declare module "*.glsl?raw" {
  const value: string;
  export default value;
}

declare module "*?worker" {
  const func: new (options?: WorkerOptions) => Worker;
  export default func;
}

declare module "*?worker&inline" {
  const func: new (options?: WorkerOptions) => Worker;
  export default func;
}

/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame) */
interface VideoFrame {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/codedHeight) */
  readonly codedHeight: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/codedRect) */
  readonly codedRect: DOMRectReadOnly | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/codedWidth) */
  readonly codedWidth: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/colorSpace) */
  readonly colorSpace: VideoColorSpace;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/displayHeight) */
  readonly displayHeight: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/displayWidth) */
  readonly displayWidth: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/duration) */
  readonly duration: number | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/format) */
  readonly format: any | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/timestamp) */
  readonly timestamp: number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/visibleRect) */
  readonly visibleRect: DOMRectReadOnly | null;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/allocationSize) */
  allocationSize(options?: any): number;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/clone) */
  clone(): VideoFrame;
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/VideoFrame/close) */
  close(): void;
  copyTo(destination: BufferSource, options?: any): Promise<any[]>;
}

declare const VideoFrame: {
  prototype: VideoFrame;
  new (image: CanvasImageSource, init?: any): VideoFrame;
  new (data: BufferSource, init: any): VideoFrame;
};

declare const AudioData: {
  prototype: AudioData;
  new (options: any): AudioData;
};
