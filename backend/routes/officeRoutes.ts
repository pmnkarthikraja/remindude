import express from 'express';
import FormDataController from '../controllers/officeController'; 

const router = express.Router();

router.post('/formdata', FormDataController.create);
router.get('/formdata/id/:id', FormDataController.getById);
router.get('/formdata/:email', FormDataController.getAll);
router.put('/formdata/:id', FormDataController.update);
router.delete('/formdata/:id', FormDataController.delete);
router.post('/formdata-bulkoperation',FormDataController.bulkOperation)

export default router;
