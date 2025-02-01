import { Router } from 'express';
import {
    getAllCertificationsController,
    getCertificationByIdController,
    createCertificationController,
    updateCertificationController,
    deleteCertificationController
} from '../controllers/certificationController';

const router = Router();

router.get('/', getAllCertificationsController);
router.get('/:id', getCertificationByIdController);
router.post('/', createCertificationController);
router.put('/:id', updateCertificationController);
router.delete('/:id', deleteCertificationController);

export default router;
