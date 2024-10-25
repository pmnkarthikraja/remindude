import FormDataRepository from '../repo/officeRepo';
import FormModel,{ Agreements, FormData as FormDataType, HouseRentalRenewal, InsuranceRenewals, IQAMARenewals, PurchaseOrder, VisaDetails } from '../models/OfficeModel';
import admin from 'firebase-admin';
import userRepo from '../repo/userRepo';
import {v4} from 'uuid'


function translate(data:any):FormDataType{
  switch (data.category) {
    case 'Agreements':
      return data as Agreements;
    case 'Purchase Order':
      return data as PurchaseOrder;
    case 'Visa Details':
      return data as VisaDetails;
    case 'IQAMA Renewals':
      return data as IQAMARenewals;
    case 'Insurance Renewals':
      return data as InsuranceRenewals;
    case 'House Rental Renewal':
      return data as HouseRentalRenewal;
    default:
      throw new Error('Invalid category');
  }
}


class FormDataService {
  async createFormData(formData: FormDataType): Promise<FormDataType> {
    try {
      const createdData = await FormDataRepository.create(formData);
      //do all the stuff
      if (formData.assignedTo) {
        const newData = {...formData, assignedBy:formData.email, assignedTo:undefined, email: formData.assignedTo.email, id: v4()}
        const gotNewData = translate(newData)

        console.log("got new Data: ",gotNewData)
        
        const gotnewDataRes = await FormDataRepository.create(gotNewData)
        
        console.log("successfully added: ",gotnewDataRes)
        const gotUser = await userRepo.findOneByEmail(formData.email)

        //notify the user.
        //we need to get token from user
        //send push notification with fcm
        const pixelToken = "cwWdgtpvR4a2WjMa3zFFLG:APA91bFUYoWvo9Wn9L0rdU1hacy3mntzMeeudUH2vkrHjA0MpMftOJf_G9uiYBFi1w0VmkfYQA9vYXVtktc9Ypa5Mx75MmxyrL4aeyZXHT5TdL4bwKgbTq8"
        const vivoToken = 'dJTPzh4OQmC0tG7c0yaVqk:APA91bHCRtM-0fcar8PDguz9u4wuKSFCQQ7ZHoWchqp-AdJ8QVYcUk49g2xA5ExNMDlFc7UKq6xmgvIh4XNm0IdIaou-h5jWxaVVqKOwKkSExe8Bz2_FHOI'

        const notificationPayload = {
          notification: {
            title: 'Hi, You have the new message!',
            body: `${gotUser?.userName} has assigned you the task, ${formData.category}`,
          },
          token: pixelToken,
        };

        admin.messaging().send(notificationPayload)
          .then(response => {
            console.log('Successfully sent message:', response);
          })
          .catch(error => {
            console.error('Error sending message:', error);
          });

      }
      return createdData;
    } catch (error: any) {
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
    } catch (error: any) {
      throw new Error(`Error retrieving FormData: ${error.message}`);
    }
  }

  async getAllFormData(email: string): Promise<FormDataType[]> {
    try {
      const data = await FormDataRepository.readAll(email);
      return data;
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      throw new Error(`Error deleting FormData: ${error.message}`);
    }
  }
}

export default new FormDataService();
