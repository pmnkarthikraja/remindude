import express from 'express';
import FormDataController from '../controllers/officeController'; 

const router = express.Router();

router.post('/formdata', FormDataController.create);
router.get('/formdata/:id', FormDataController.getById);
router.get('/formdata', FormDataController.getAll);
router.put('/formdata/:id', FormDataController.update);
router.delete('/formdata/:id', FormDataController.delete);

export default router;
