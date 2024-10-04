import FormDataRepository from '../repo/officeRepo';
import { FormData as FormDataType } from '../models/OfficeModel';

class FormDataService {
  async createFormData(formData: FormDataType): Promise<FormDataType> {
    try {
      const createdData = await FormDataRepository.create(formData);
      return createdData;
    } catch (error:any) {
      throw new Error(`Error creating FormData: ${error.message}`);
    }
  }

  async getFormDataById(id: string): Promise<FormDataType | null> {
    try {
      const data = await FormDataRepository.read(id);
      if (!data) {
        throw new Error(`FormData with ID ${id} not found.`);
      }
      return data;
    } catch (error:any) {
      throw new Error(`Error retrieving FormData: ${error.message}`);
    }
  }

  async getAllFormData(): Promise<FormDataType[]> {
    try {
      const data = await FormDataRepository.readAll();
      return data;
    } catch (error:any) {
      throw new Error(`Error retrieving all FormData: ${error.message}`);
    }
  }

  async updateFormData(id: string, updateData: FormDataType): Promise<FormDataType | null> {
    try {
      const updatedData = await FormDataRepository.update(id, updateData);
      if (!updatedData) {
        throw new Error(`FormData with ID ${id} not found.`);
      }
      return updatedData;
    } catch (error:any) {
      throw new Error(`Error updating FormData: ${error.message}`);
    }
  }

  async deleteFormData(id: string): Promise<FormDataType | null> {
    try {
      const deletedData = await FormDataRepository.delete(id);
      if (!deletedData) {
        throw new Error(`FormData with ID ${id} not found.`);
      }
      return deletedData;
    } catch (error:any) {
      throw new Error(`Error deleting FormData: ${error.message}`);
    }
  }
}

export default new FormDataService();
