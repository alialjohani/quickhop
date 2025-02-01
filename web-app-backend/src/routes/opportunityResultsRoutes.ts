import { Router } from 'express';
import {
    getAllOpportunityResultsController,
    getOpportunityResultsByIdController,
    createOpportunityResultsController,
    updateOpportunityResultsController,
    deleteOpportunityResultsController
} from '../controllers/opportunityResultsController';

const router = Router();

router.get('/', getAllOpportunityResultsController);
router.get('/:id', getOpportunityResultsByIdController);
router.post('/', createOpportunityResultsController);
router.put('/:id', updateOpportunityResultsController);
router.delete('/:id', deleteOpportunityResultsController);

export default router;
