import { logger } from "./utils/logger";

type Comment = { user: string; comment: string; followRole: string };

let queue: Comment[] = [];
const maxSize = 10;
let io: any = null;

export const initialize = (socketIo: any) => (io = socketIo);

const emitQueueUpdate = () => {
  if (!io) return console.log("Socket.io not initialized, cannot emit queue update");
  io.emit("UpdateQueue", queue);
};

export const enqueue = (item: Comment) => {
  if (queue.length >= maxSize) return false;
  queue.push(item);
  logger.queue(`Added: | "${item.comment}" |`);
  emitQueueUpdate();
  return true;
};

export const dequeue = () => {
  const removed = queue.shift();
  emitQueueUpdate();
  return removed;
};

export const deleteComment = (i: number) => {
  if (i < 0 || i >= queue.length) return false;
  const [deleted] = queue.splice(i, 1);
  logger.queue(`Deleted: | ${deleted.user}: "${deleted.comment}"`);
  emitQueueUpdate();
  return true;
};

export const size = () => queue.length;

export const clear = () => {
  queue = [];
  logger.info("Queue cleared");
  emitQueueUpdate();
};

export const getQueue = () => queue;

export { queue, maxSize };
