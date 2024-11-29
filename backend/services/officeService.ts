import FormDataRepository from '../repo/officeRepo';
import FormModel, { Agreements, FormData as FormDataType, HouseRentalRenewal, InsuranceRenewals, IQAMARenewals, PurchaseOrder, VisaDetails } from '../models/OfficeModel';
import admin from 'firebase-admin';
import userRepo from '../repo/userRepo';
import fcmTokenRepo from '../repo/fcmTokenRepo';
import { v4 } from 'uuid'


function translate(data: any): FormDataType {
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
        const newData = { ...formData, assignedBy: formData.email, assignedTo: undefined, email: formData.assignedTo.email, id: v4() }
        const gotNewData = translate(newData)

        await FormDataRepository.create(gotNewData)

        const gotUser = await userRepo.findOneByEmail(formData.email)

        //notify the user.
        //we need to get token from user
        //send push notification with fcm
        //collect token from fcmToken model

        const tokenData = await fcmTokenRepo.getByEmail(formData.assignedTo.email)

        if (tokenData != null && tokenData.tokens.length > 0) {

            const notificationPromises = tokenData.tokens.map(async (token) => {
          
              const notificationPayload = {
              notification: {
                title: 'Hi, You have the new message!',
                body: `${gotUser?.userName} has assigned you the task, ${formData.category}`,
              },
              token: token,
            };

            try{
              const response =await admin.messaging().send(notificationPayload)
              console.log('Successfully sent message:', response);
            }catch(e:any){  
              //token failed or expired
              await fcmTokenRepo.removeToken(formData.assignedTo?.email, token)
              console.error('Error sending message:', e);
            }
          });

          await Promise.all(notificationPromises)
        }
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

  async bulkCreateOrUpdateOrDeleteFormData(formDataArray:FormDataType[],email:string):Promise<void[]>{
    const insertedData:FormDataType[]=[];
    const updatedData:FormDataType[] =[];
    const idsToDelete: string[] = [];

    const existingData = await FormDataRepository.readAll(email)

    const existingIds = new Set(existingData.map((data) => data.id));


    try{
      for (const formData of formDataArray){
        if (formData.id){
          const existingRecord = existingData.find((data) => data.id === formData.id);

          if (existingRecord) {
            updatedData.push(formData); // Mark as update
            existingIds.delete(formData.id); // Remove the ID from the set, as it's being updated
          } else {
            insertedData.push(formData); // Mark as new
          }
        }else{
          insertedData.push(formData)
        }
      }

      idsToDelete.push(...existingIds);


      const insertPromises = insertedData.map(async (data)=>{
        await this.createFormData(data)
      })

      const updatePromises = updatedData.map(async (data)=>{
        await this.updateFormData(data.id,data)
      })

      const deletePromises = idsToDelete.map(async (id) => {
        await this.deleteFormData(id);
      });

      const [insertResults,updateResults,deleteResults]=await Promise.all([
        Promise.all(insertPromises),
        Promise.all(updatePromises),
        Promise.all(deletePromises),
      ])
      return [...insertResults, ...updateResults,...deleteResults];

    }catch(error:any){
      throw new Error(`Error processing bulk operation: ${error.message}`);
    }

  }
}

export default new FormDataService();
