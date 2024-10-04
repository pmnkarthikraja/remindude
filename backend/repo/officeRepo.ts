import FormData, { FormData as FormDataType, Agreements, PurchaseOrder, VisaDetails, IQAMARenewals, InsuranceRenewals } from '../models/OfficeModel'; 

class FormDataRepository {
  async create(formData: FormDataType): Promise<FormDataType> {
    const newFormData = new FormData({ ...formData });
    return await newFormData.save() as FormDataType;
  }

  async read(id: string): Promise<FormDataType | null> {
    const data = await FormData.findOne({ id }).exec();
    return this.validateFormData(data);
  }

  async readAll(): Promise<FormDataType[]> {
    const data = await FormData.find({}).exec();
    const formdata= data.map(this.validateFormData).filter(r=>r!=null);
    return formdata
  }

  async update(id: string, updateData: FormDataType): Promise<FormDataType | null> {
    const updatedData = await FormData.findOneAndUpdate({ id }, updateData, { new: true }).exec();
    return this.validateFormData(updatedData);
  }

  async delete(id: string): Promise<FormDataType | null> {
    const deletedData = await FormData.findOneAndDelete({ id }).exec();
    return this.validateFormData(deletedData);
  }
  
  private validateFormData(data: any): FormDataType | null {
    if (!data) return null;

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
      default:
        throw new Error('Invalid category');
    }
  }
}

export default new FormDataRepository();
