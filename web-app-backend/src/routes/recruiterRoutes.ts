import { Router } from 'express';
import {
    getAllRecruitersController,
    getRecruiterByIdController,
    createRecruiterController,
    updateRecruiterController,
    deleteRecruiterController,
} from '../controllers/recruiterController';

const router = Router();

router.get('/', getAllRecruitersController);
router.get('/:id', getRecruiterByIdController);
router.post('/', createRecruiterController);
router.put('/:id', updateRecruiterController);
router.delete('/:id', deleteRecruiterController);


export default router;
