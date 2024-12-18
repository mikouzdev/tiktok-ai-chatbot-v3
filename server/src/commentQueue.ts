import { logger } from "./utils/logger";

export let queue: { user: string; comment: string; followRole: number }[] = []; // Initialize an empty queue
const maxSize = 10; // Maximum size of the queue
let io: any = null;

// Function to initialize the socket.io object for emitting queue updates
const initialize = (socketIo) => {
  io = socketIo;
};
// Function to emit queue updates to the client
const emitQueueUpdate = () => {
  if (io) {
    io.emit("UpdateQueue", getQueue());
  }
};

// Function to add a comment to the queue
export const enqueue = (comment: {
  user: string;
  comment: any;
  followRole: number;
}) => {
  // Check if queue not full
  if (queue.length < maxSize) {
    queue.push(comment); // Add comment to queue
    logger.queue(`Added: | "${comment.comment}" | to the queue ->`); // Log the addition of the comment
    emitQueueUpdate(); // Emit queue update to the client via socket.io
    return true; // Successfully added to queue
  } else {
    return false; // Else, return false (queue is full)
  }
};

// handles moving the queue forward
export const dequeue = () => {
  const removedItem = queue.shift();
  emitQueueUpdate();
  return removedItem;
};

// Function to get the current size of the queue
export function size() {
  return queue.length;
}

// Function to clear the queue fully
export function clear() {
  queue = [];
  logger.info("Queue cleared!");
  emitQueueUpdate();
}

// Function to get the current queue
export function getQueue() {
  return queue;
}

// handles deleting a comment from the queue
export function deleteComment(index: number) {
  // Check if the index is a valid number
  if (typeof index !== "number" || isNaN(index)) {
    console.error("Invalid index. Index must be a valid number.");
    return false;
  }

  // Check if the index is within the valid range
  if (index < 0 || index >= queue.length) {
    console.error("Index out of range. Index must be within the queue length.");
    return false;
  }

  try {
    const [deletedComment] = queue.splice(index, 1);
    logger.queue(
      `Deleted from queue: | ${deletedComment.user}: "${deletedComment.comment}"`
    );
    emitQueueUpdate();
    return true;
  } catch (error) {
    // Handle any errors that may occur during the splice operation or logging
    console.error("Error deleting comment:", error);
    return false;
  }
}

module.exports = {
  initialize,
  enqueue,
  dequeue,
  size,
  clear,
  getQueue,
  deleteComment,
  maxSize,
};
