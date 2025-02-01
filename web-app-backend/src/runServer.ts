import setupDb from './models/associations';
import { sequelize } from './models';
import logger from './utils/logger';
import app from './app';
import { startingCron, stopCron } from './CronTasks/CronTasks';
import dotenv from 'dotenv';
dotenv.config();

/** force: true: This option will drop existing tables and create new ones based on your current models. 
* This is great for development but will erase any existing data in those tables. 
* Change this when moving to production or once you stabilize your data model. */
setupDb();
sequelize?.sync({ alter: true })
    .then(() => {
        logger.info('Database & tables updated!');
    })
    .catch((error: any) => {
        logger.error('Error syncing database:' + error);
    });


const PORT = process.env.PORT || 3000;
const URL = process.env.URL || "";

const server = app.listen(PORT, () => {
    startingCron();
    logger.info(`Server is running on ${URL}:${PORT}`);
});


// Handle server shutdown
const stopServer = () => {
    //console.log('Stopping server...');
    stopCron();
    server.close(() => {
        //console.log('Server stopped.');
        process.exit(0);
    });
};

// Listen for termination signals to gracefully stop
process.on('SIGINT', stopServer);  // Ctrl+C in terminal
process.on('SIGTERM', stopServer); // Kill command
