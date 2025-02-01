/**
 * CronTasks.ts
 * To perform scheduled tasks
 */
import cron from 'node-cron';
import { updateAllJobPostStatus } from '../controllers/recruitmentController';
import logger from '../utils/logger';


let cronTask: cron.ScheduledTask = cron.schedule(
    // '0 */6 * * *', // every six hours
    '* * * * *',
    () => {

        logger.info('CronTasks Work...');
        // Check job posts status that needs to be updated.
        updateAllJobPostStatus();
    },
    {
        scheduled: false,
    }
);


export const startingCron = () => {
    cronTask.start();
};

// Handle server shutdown
export const stopCron = () => {
    // Stop the cron task
    if (cronTask) {
        cronTask.stop();
        logger.info('CronTasks Stopped...')
    }
};
