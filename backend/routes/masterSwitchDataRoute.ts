import { Router } from 'express';
import MasterSwitchController from '../controllers/MasterSwitchController';

const router: Router = Router();

router.post('/toggle-master-switch-data', MasterSwitchController.toggle);
router.get('/master-switch-data/:email', MasterSwitchController.getMasterSwitchData);

export default router;

