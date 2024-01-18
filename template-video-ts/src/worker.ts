/**
 *
 * @param videoFrame
 * @returns new video frame
 */
async function processFrame(videoFrame: VideoFrame) {
  console.warn("worker MockExtension processByVideoFrame");
  return videoFrame;
}

const worker = self as unknown as Worker;

worker.onmessage = async (event) => {
  const { data } = event;
  if (data.type === "process") {
    const { data: frame, id } = data;
    const newFrame = await processFrame(frame);
    worker.postMessage({ type: "process", id, data: newFrame }, [newFrame]);
  }
};
