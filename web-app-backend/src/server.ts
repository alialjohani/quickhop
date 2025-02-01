/**
 * main entry: node server.js
 * This is just to initialize the server with any prerequisite such as: fetching password 
 */
import dotenv from 'dotenv';
dotenv.config();
import { SecretManager } from './services/AWS/SecretManager';

(async function initializeServer() {
    try {
        if (process.env.environment === 'PROD') {
            // Fetch and set the database password
            process.env._PASSWORD = await SecretManager(process.env.DB_PASSWORD || '');
        }
        // Start the running the server
        import('./runServer'); // Delay importing until all necessary env variables are ready.
    } catch (err) {
        console.error('Error initializing server:', err);
        process.exit(1);
    }
})();