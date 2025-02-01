import express, { NextFunction, Request, Response } from 'express';
import companyRoutes from './routes/companyRoutes';
import recruiterRoutes from './routes/recruiterRoutes';
import jobSeekerRoutes from './routes/jobSeekerRoutes';
import jobPostRoutes from './routes/jobPostRoutes';
import educationRoutes from './routes/educationRoutes';
import workRoutes from './routes/workRoutes';
import certificationRoutes from './routes/certificationRoutes';
import opportunityResultsRoutes from './routes/opportunityResultsRoutes';
import recruitmentRoutes from './routes/recruitmentRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import { AppError } from './errors/AppError';
import { authHandler } from './middleware/authMiddleware';
import logger from './utils/logger';

const allowedOrigin = process.env.ALLOWED_ORIGIN || "";

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Health Check for AWS
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).send('OK');
});

app.use((req: Request, res: Response, next: NextFunction): void => {
    logger.info('req.headers.origin: ' + req.headers.origin);
    logger.info('allowedOrigin: ' + allowedOrigin);
    // Check if the request's origin is in the list of allowed origins
    if (req.headers.origin === allowedOrigin || req.headers.origin === undefined) {
        // If the origin is allowed, set the CORS headers
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, userType');

        // Handle preflight request
        if (req.method === 'OPTIONS') {
            logger.info('Response with OPTIONS as 204');
            res.status(200).end(); // Respond with 204 for OPTIONS (preflight)
            return;
        }
    } else {
        // If the origin is not allowed, respond with an error
        res.status(403).json({ message: 'Forbidden this origin is not allowed.' });
        return;
    }
    next();
});

// Authentication
app.use(authHandler);


// Companies routes
app.use('/api/companies', companyRoutes);

// Recruiters routes
app.use('/api/recruiters', recruiterRoutes);

// Job Seeker routes
app.use('/api/job-seekers', jobSeekerRoutes);

// Job Post routes
app.use('/api/job-posts', jobPostRoutes);

// Education routes
app.use('/api/educations', educationRoutes);

// Work routes
app.use('/api/works', workRoutes);

// Certification routes
app.use('/api/certifications', certificationRoutes);

// OpportunityResults routes
app.use('/api/opportunity-results', opportunityResultsRoutes);

// This endpoint for business needs
app.use('/api/recruitment', recruitmentRoutes);


// Catch-all for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError('Routes Error', 404, `Cannot find ${req.method} ${req.originalUrl} on this server`));
});

// Error handler middleware (must have 4 parameters to be recognized as an error handler)
app.use(errorHandler);

logger.info("app initialized.");
export default app;
