export const logger = {
  info: (message) => console.log(`[INFO]: ${message}`),
  error: (message, err) => console.error(`[ERROR]: ${message}`, err),
  queue: (message) => console.log(`[QUEUE]: ${message}`),
};
