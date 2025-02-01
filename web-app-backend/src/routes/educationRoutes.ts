import { Router } from 'express';
import {
    getAllEducationsController,
    getEducationByIdController,
    createEducationController,
    updateEducationController,
    deleteEducationController
} from '../controllers/educationController';

const router = Router();

router.get('/', getAllEducationsController);
router.get('/:id', getEducationByIdController);
router.post('/', createEducationController);
router.put('/:id', updateEducationController);
router.delete('/:id', deleteEducationController);

export default router;
