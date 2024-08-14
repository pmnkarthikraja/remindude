import { Router } from 'express';
import UserController from '../controllers/userController';
import multer from 'multer';
import { authenticateJWT } from '../utils/verifyAuth';

const router: Router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/signup-email', UserController.signUpEmail);
router.post('/signup-google', UserController.signUpGoogle);
router.post('/signin-email', UserController.signInEmail);
router.post('/signin-google', UserController.signInGoogle);
router.post('/auth-user',authenticateJWT, UserController.authUser);
router.post('/send-otp', UserController.sendOTP);
router.post('/verify-otp', UserController.verifyOTP);
router.put('/update-user',upload.single('profilePicture'), UserController.updateUser);
router.put('/reset-password', UserController.resetPassword);
router.post('/validate-password',UserController.validatePassword)

export default router;

