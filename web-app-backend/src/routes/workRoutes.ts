import { Router } from 'express';
import {
    getAllWorksController,
    getWorkByIdController,
    createWorkController,
    updateWorkController,
    deleteWorkController
} from '../controllers/workController';

const router = Router();

router.get('/', getAllWorksController);
router.get('/:id', getWorkByIdController);
router.post('/', createWorkController);
router.post('/:id', updateWorkController);
router.delete('/:id', deleteWorkController);

export default router;
