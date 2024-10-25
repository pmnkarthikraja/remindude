import { Router } from 'express';
import FCMTokenController from '../controllers/fcmTokenController';

const router: Router = Router();
router.post('/fcmTokens', FCMTokenController.createFcmToken);
router.get('/fcmTokens', FCMTokenController.getAllFcmTokens);
router.get('/fcmTokens/:email', FCMTokenController.getTokensByEmail);


export default router;