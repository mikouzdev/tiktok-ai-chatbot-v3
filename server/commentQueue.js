const logger = require("../utils/logger.js");

let queue = []; // Initialize an empty queue
const maxSize = 10; // Maximum size of the queue
let io = null;

// Function to initialize the socket.io object for emitting queue updates
const initialize = (socketIo) => {
  io = socketIo;
};
// Function to emit queue updates to the client
const emitQueueUpdate = () => {
  if (io) {
    io.emit("queueUpdate", getQueue());
  }
};

// Function to add a comment to the queue
const enqueue = (comment) => {
  if (queue.length < maxSize) {
    // Check if queue not full
    queue.push(comment); // Add comment to queue
    emitQueueUpdate(); // Emit queue update to the client via socket.io
    logger.queue(`Added: | "${comment.comment}" | to the queue ->`); // Log the addition of the comment
    return true; // Successfully added to queue
  } else {
    return false; // Else, return false (queue is full)
  }
};

// handles moving the queue forward
const dequeue = () => {
  const removedItem = queue.shift();
  emitQueueUpdate();
  return removedItem;
};

const size = () => queue.length; // Function to get the current queue size

// Function to clear the queue fully
const clear = () => {
  queue = [];
  logger.info("Queue cleared!");
  emitQueueUpdate();
};

// Function that returns current queue data
const getQueue = () => queue;

// handles deleting a comment from the queue
const deleteComment = (index) => {
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
    console.error("Error deleting comment:", error.message);
    return false;
  }
};

// Simulate batch addition of comments to the queue
const simulateQueueData = () => {
  const fakeComments = [
    { user: "x_username_325", comment: "eka kommentti", followRole: 2 },
    { user: "y_suparm4ny", comment: "vihainen kommentti 1", followRole: 1 },
    { user: "jaakko03", comment: "kk", followRole: 2 },
    { user: "spi_on_paras444", comment: "moi mitem nmenee?!=!", followRole: 1 },
    {
      user: "keltainen_auto_mies_0143",
      comment:
        "This is a comment from User5 ja tämä on todeeella pitkä komntentittitit!?!?!?!!",
      followRole: 0,
    },
  ];

  fakeComments.forEach((comment) => {
    enqueue(comment);
  });

  // console.log("Simulated queue data:", getQueue());
};

module.exports = {
  initialize,
  enqueue,
  dequeue,
  size,
  clear,
  getQueue,
  deleteComment,
  maxSize,
  simulateQueueData,
};
