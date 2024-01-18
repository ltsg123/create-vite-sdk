import { MockExtension } from "../src/index";

let stream: MediaStream;
let ext: MockExtension;
let ext2: MockExtension;

export async function setupCamera(video: HTMLVideoElement) {
  stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  useExtension(
    document.querySelector<HTMLVideoElement>("#after-extension")!,
    document.querySelector<HTMLVideoElement>("#canvas-extension")!
  );
}

export function useExtension(
  video: HTMLVideoElement,
  video2: HTMLVideoElement
) {
  if (!stream) {
    return;
  }
  ext = new MockExtension();
  ext2 = new MockExtension();

  // @ts-ignore
  ext.__registered__ = true;
  // @ts-ignore
  ext2.__registered__ = true;
  ext.disable();
  ext2.disable();

  const videoTrack = stream.getVideoTracks()[0];

  const videoFrameStream = new MediaStream();
  const videoFrameTrack = transformTrack(videoTrack, [
    ext.applyEffect.bind(ext),
    ext2.applyEffect.bind(ext2),
  ]);

  videoFrameStream.addTrack(videoFrameTrack);
  video.srcObject = videoFrameStream;

  const videoTrack2 = videoTrack.clone();
  const canvasStream = new MediaStream();
  const newVideoTrack = transformTrack(
    videoTrack2,
    [ext.applyEffect.bind(ext), ext2.applyEffect.bind(ext2)],
    true
  );

  canvasStream.addTrack(newVideoTrack);
  video2.srcObject = canvasStream;

  bindEvents();
}

function bindEvents() {
  if (ext) {
    document
      .querySelector("#ext-switch")
      ?.addEventListener("click", async () => {
        const button = document.querySelector(
          "#ext-switch"
        ) as HTMLButtonElement;
        if (ext.enabled) {
          ext.disable();
          button.style.backgroundColor = "";
          button.innerHTML = "ENABLE";
        } else {
          button.innerHTML = "DISABLE";
          button.style.backgroundColor = "yellowgreen";
          ext.enable();
        }
      });
  }
  if (ext2) {
    document
      .querySelector("#ext2-switch")
      ?.addEventListener("click", async () => {
        const button = document.querySelector(
          "#ext2-switch"
        ) as HTMLButtonElement;
        if (ext2.enabled) {
          ext2.disable();
          button.style.backgroundColor = "";
          button.innerHTML = "ENABLE";
        } else {
          button.innerHTML = "DISABLE";
          button.style.backgroundColor = "yellowgreen";
          ext2.enable();
        }
      });
  }
}

export function transformTrack(
  track: MediaStreamTrack,
  transforms: any[],
  isGL: boolean = false
): MediaStreamTrack {
  if (transforms.length === 0) {
    return track;
  }
  if ("TransformStream" in window && !isGL) {
    // @ts-ignore
    const processor = new MediaStreamTrackProcessor(track);
    // @ts-ignore
    const generator = new MediaStreamTrackGenerator({
      kind: track.kind,
    });

    const transformStream = new TransformStream({
      transform: async (frame, controller) => {
        let newFrame = frame;
        for (const transform of transforms) {
          try {
            newFrame = await transform(newFrame);
          } catch (error) {
            newFrame = frame;
          }
        }

        controller.enqueue(newFrame);
      },
    });
    processor.readable.pipeThrough(transformStream).pipeTo(generator.writable);
    //@ts-ignore
    return generator as MediaStreamTrack;
  } else {
    if (track.kind === "video") {
      const video = document.createElement("video");
      video.style.display = "none";
      video.setAttribute("playsinline", "");
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = new MediaStream([track]);
      const canvas = document.createElement("canvas");

      new Promise((resolve) => {
        video.oncanplay = () => {
          video.onplaying = () => {
            video.onplaying = null;
            resolve(null);
          };
          video.play();
          video.oncanplay = null;
        };
      }).then(() => {
        const {
          width = video.videoWidth,
          height = video.videoHeight,
          frameRate = 30,
        } = track.getSettings();
        video.width = width;
        video.height = height;
        canvas.width = width;
        canvas.height = height;
        const WEBGL_ATTRIBUTES = {
          alpha: false,
          antialias: false,
          premultipliedAlpha: false,
          preserveDrawingBuffer: false,
          depth: false,
          stencil: false,
          failIfMajorPerformanceCaveat: true,
          powerPreference: "high-performance",
        };
        const gl = canvas.getContext(
          "webgl2",
          WEBGL_ATTRIBUTES
        ) as WebGL2RenderingContext | null;
        if (!gl) {
          throw new Error("WebGL2 is not supported on this deivce");
        }

        const glOptions: any = {
          gl,
          fbo: video,
          resolution: { width, height },
          isDraft: transforms.length > 1 ? false : true,
        };
        setInterval(async () => {
          for (const index in transforms) {
            try {
              if (+index === transforms.length - 1) {
                glOptions.isDraft = true;
              }

              const result = await transforms[index](glOptions);
              if (result) {
                glOptions.fbo = result;
              }
            } catch (error) {
              return Promise.resolve(null);
            }
          }
        }, 1000 / frameRate);
      });
      return canvas.captureStream().getVideoTracks()[0];
    } else {
      // @to do 暂时不支持
      return track;
    }
  }
}
