import pino from 'pino';
import path from 'path';
import fs from 'fs';

// Define the log folder and ensure it exists
const logFolder = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logFolder)) {
    fs.mkdirSync(logFolder);
}

// Generate the file name in 'yyyy-mm-dd.log' format
const date = new Date();
let fileName = date.toISOString().split('T')[0] + '.log';
const logFilePath = path.join(logFolder, fileName);

// Create the logger instance
const logger = pino(
    {
        level: process.env.LOG_LEVEL || 'info', // Default log level
        base: null, // Exclude pid and hostname
        timestamp: () => `,"time":"${new Date().toISOString()}"`, // Human-readable time
    },
    pino.destination(logFilePath) // Stream logs to the file
);

export default logger;