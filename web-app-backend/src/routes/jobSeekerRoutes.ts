import { Router } from 'express';
import {
    getAllJobSeekersController,
    getJobSeekerByIdController,
    createJobSeekerController,
    updateJobSeekerController,
    deleteJobSeekerController
} from '../controllers/jobSeekerController';

const router = Router();

router.get('/', getAllJobSeekersController);
router.get('/:id', getJobSeekerByIdController);
router.post('/', createJobSeekerController);
router.put('/:id', updateJobSeekerController);
router.delete('/:id', deleteJobSeekerController);

export default router;
