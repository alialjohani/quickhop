/**
 * These routes for specific frontend/business needs, other than general endpoints that CRUD models.
 * In other words, these serve the frontend directly.
 */
import { Router } from 'express';
import {
    getAllOpportunityResultsByJobPostIdController,
    getRecruiterJobPostsDataController,
    getJobSeekerCVController,
    getJobSeekerInterviewResultsController,
    getJobSeekerOpportunitiesController,
    postJobSeekerCVController,
    updateRecruiterProfileController,
    getUserIdByToken,
    getCompanyByRecruiterIdController,
    updateCompanyKBByRecruiterIdController,
    aiGenerateInterviewQuestionsController,
    aiFeedbackOnJobSeekerCVController,
    updateOpportunityResultStatusByIdController,
    deactivateJobPostController,
    aiCheckOpenEndQuestionController,
} from '../controllers/recruitmentController';
import { newJobPostProcessController } from '../controllers/newJobPostProcessController';
import { downloadFileController } from '../controllers/downloadFilesController';
const router = Router();


// To get the user id, when logged in with the Google/AWS
router.get('/users', getUserIdByToken);


router.get('/recruiter/:id/company', getCompanyByRecruiterIdController);
router.put('/recruiter/:id/company/knowledge-base', updateCompanyKBByRecruiterIdController);

// For recruiter to update the opportunityResult status: SELECTED, NOT_SELECTED
router.post('/recruiter/opportunity-result-status/:id', updateOpportunityResultStatusByIdController);

// To update a recruiter profile
router.put('/:id/profile', updateRecruiterProfileController);

// (id: recruiter id) use getAllJobPostsController, and add then a field to know the specific number of opportunities (totalSelectedCandidates)
router.get('/:id/job-posts', getRecruiterJobPostsDataController);
// by recruiter id and jobPostId, deactivate the job post immediately by changing its status to complete.
router.get('/:id/job-posts/:jobPostId', deactivateJobPostController);

// To get the results once the job post is in 'Complete' status, 
// the results are from OpportunityResults table and is based on jobPostId
// Additional fields for frontend: job seeker name, job seeker phone from JobSeeker Model
router.get('/job-post/:id/results', getAllOpportunityResultsByJobPostIdController);

// To get the job seeker C.V. details, that includes his profile from JobSeeker model, 
// his works, his educations, his certifications all at once
router.get('/job-seeker/:id/cv', getJobSeekerCVController);

// To create if not exist or replace the job seeker C.V. details, 
// that includes his profile JobSeeker model, 
// his works, his educations, his certifications all at once
router.post('/job-seeker/:id/cv', postJobSeekerCVController);

// For job seeker, get the interview results  
router.get('/job-seeker/:id/interview-results', getJobSeekerInterviewResultsController);

// For job seeker, get the opportunities  
router.get('/job-seeker/:id/opportunities', getJobSeekerOpportunitiesController);

// AI: let AI generate interview questions based on job post data to be reviewed by recruiter 
router.post('/ai/interview-questions', aiGenerateInterviewQuestionsController);

// AI: let AI generate feedback on CVs for job seeker to help him provide more details  
router.post('/ai/cv-feedback', aiFeedbackOnJobSeekerCVController);

// AI: check the question if open-end or not (open-end leads to longer answer which is not supported in system)
router.post('/ai/is-open-end-question', aiCheckOpenEndQuestionController);

// To download resumes from S3, get signed URL
router.get('/opportunity-results/:id/download/:fileType', downloadFileController);


router.post('/ai/test', newJobPostProcessController);




export default router;