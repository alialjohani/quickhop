import { Router } from 'express';
import {
    getAllCompaniesController,
    getCompanyByIdController,
    createCompanyController,
    updateCompanyController,
    deleteCompanyController,
} from '../controllers/companyController';

const router = Router();

// General CRUD
router.get('/', getAllCompaniesController);
router.get('/:id', getCompanyByIdController);
router.post('/', createCompanyController);
router.put('/:id', updateCompanyController);
router.delete('/:id', deleteCompanyController);

export default router;
