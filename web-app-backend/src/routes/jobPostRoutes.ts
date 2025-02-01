import { Router } from 'express';
import {
    getAllJobPostsController,
    getJobPostByIdController,
    createJobPostController,
    updateJobPostController,
    deleteJobPostController
} from '../controllers/jobPostController';

const router = Router();

router.get('/', getAllJobPostsController);
router.get('/:id', getJobPostByIdController);
router.post('/', createJobPostController);
router.put('/:id', updateJobPostController);
router.delete('/:id', deleteJobPostController);

export default router;
