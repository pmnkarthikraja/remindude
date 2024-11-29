import { Request, Response } from 'express';
import FormDataService from '../services/officeService'; 
import {FormData as FormDataType} from '../models/OfficeModel';

class FormDataController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const newFormData = await FormDataService.createFormData(req.body);
      return res.status(201).json(newFormData);
    } catch (error:any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const formData = await FormDataService.getFormDataById(req.params.id);
      return res.status(200).json(formData);
    } catch (error:any) {
      return res.status(404).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const email = req.params.email
      const formDataList = await FormDataService.getAllFormData(email);
      return res.status(200).json(formDataList);
    } catch (error:any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const updatedFormData = await FormDataService.updateFormData(req.params.id, req.body);
      return res.status(200).json(updatedFormData);
    } catch (error:any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const deletedFormData = await FormDataService.deleteFormData(req.params.id);
      return res.status(200).json(deletedFormData);
    } catch (error:any) {
      return res.status(404).json({ error: error.message });
    }
  }

  async bulkOperation(req:Request,res:Response):Promise<Response>{
    try{
      const { email, formDataArray }: { email: string; formDataArray: FormDataType[] } = req.body;
      if (!email || !Array.isArray(formDataArray)) {
        return res.status(400).json({ message: 'Invalid input. Email and formDataArray are required.' });
      }
      await FormDataService.bulkCreateOrUpdateOrDeleteFormData(formDataArray, email);
      console.log("bulk operation success! for ",email)
      return res.status(200).json({ message: 'Bulk create or update operation completed successfully.' });
    }catch(error:any){
      console.error(error);
      return res.status(500).json({ message: `Error processing bulk operation: ${error.message}` });
    }
  }
}

export default new FormDataController();
