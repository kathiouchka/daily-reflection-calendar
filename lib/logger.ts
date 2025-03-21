import pino from 'pino';

// Create a basic logger configuration that works in all environments
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['password', 'secret', 'token'],
});

export default logger; 