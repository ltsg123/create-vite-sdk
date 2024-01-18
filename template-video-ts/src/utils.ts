import MockWorker from "./worker?worker&inline";
const worker: Worker = new MockWorker();
const workerMsgMap = new Map<string, (data: any) => void>();

worker.onmessage = async (event: any) => {
  const { data } = event;
  if (data.type === "process") {
    const { data: frame, id } = data;
    const resolve = workerMsgMap.get(id);
    workerMsgMap.delete(id);
    resolve && resolve(frame);
  }
};

function getRandomString(length: number = 7, prefix: string = ""): string {
  const str = Math.random().toString(16).substr(2, length).toLowerCase();
  if (str.length === length) return `${prefix}${str}`;

  return `${prefix}${str}` + getRandomString(length - str.length, "");
}

export async function postWorkerMessage<T extends any>(
  type: string,
  data: any,
  transfer?: Transferable[]
): Promise<T> {
  const id = getRandomString(6);

  return new Promise((resolve) => {
    workerMsgMap.set(id, resolve);
    worker.postMessage({ type, id, data }, transfer || []);
  });
}
