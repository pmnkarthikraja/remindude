import { Router } from 'express';
import HolidayController from '../controllers/holidayController';
import LocalHolidayController from '../controllers/localHolidayController';

const router: Router = Router();
router.get('/holidays', HolidayController.getHolidays);
router.get('/local-holidays',LocalHolidayController.getLocalHolidays)
router.post('/local-holidays',LocalHolidayController.upsertLocalHolidays)
router.delete('/local-holidays/:_id',LocalHolidayController.deleteLocalHoliday)


export default router;