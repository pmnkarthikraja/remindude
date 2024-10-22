import { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

// Base Interface for FormData
export interface BaseFormData extends Document {
  id: string;
  email:string;
  category: 'Agreements' | 'Purchase Order' | 'Visa Details' | 'IQAMA Renewals' | 'Insurance Renewals' | 'House Rental Renewal';
  remarks?: string;
  wantsCustomReminders: boolean;
  customReminderDates: Date[];
  reminderDates: Date[];
  completed:boolean
}

// Specific Interfaces for each category
export interface Agreements extends BaseFormData {
  category: 'Agreements';
  clientName: string;
  vendorCode: string;
  startDate: Date;
  endDate: Date;
}

export interface PurchaseOrder extends BaseFormData {
  category: 'Purchase Order';
  clientName: string;
  consultant: string;
  poNumber: string;
  poIssueDate: Date;
  poEndDate: Date;
  entryDate: Date;
}

export interface VisaDetails extends BaseFormData {
  category: 'Visa Details';
  clientName: string;
  visaNumber: string;
  sponsor: string;
  consultantName: string;
  visaEndDate: Date;
  visaEntryDate: Date;
}

export interface IQAMARenewals extends BaseFormData {
  category: 'IQAMA Renewals';
  employeeName: string;
  iqamaNumber: string;
  expiryDate: Date;
}

export interface InsuranceRenewals extends BaseFormData {
  category: 'Insurance Renewals';
  employeeName: string;
  insuranceStartDate: Date;
  insuranceEndDate: Date;
  insuranceCompany: string;
  insuranceCategory: string;
  employeeInsuranceValue: string;  
  spouseInsuranceValue?: string;    
  childrenInsuranceValues?: string[]; //upto 4 childrens
  value: string;   //consider this is the total insurance value
}

export interface HouseRentalRenewal extends BaseFormData {
  category: 'House Rental Renewal';
  houseOwnerName:string,
  location:string,
  consultantName:string,
  startDate:Date,
  endDate:Date,
  rentAmount:string,  
}

export type FormData = Agreements | PurchaseOrder | VisaDetails | IQAMARenewals | InsuranceRenewals | HouseRentalRenewal;

// Base schema with common fields
const baseFormDataSchema = new Schema<BaseFormData>({
  id: { type: String, required: true, unique:true },
  email: {type:String,required:true},
  category: { 
    type: String, 
    required: true, 
    enum: ['Agreements', 'Purchase Order', 'Visa Details', 'IQAMA Renewals', 'Insurance Renewals', 'House Rental Renewal'] 
  },
  remarks: { type: String },
  wantsCustomReminders: { type: Boolean, required: true },
  completed: { type: Boolean, required: true },
  customReminderDates: [{ type: Date }],
  reminderDates: [{ type: Date }]
}, { discriminatorKey: 'category', timestamps: true });

// Agreements Schema
const agreementsSchema = new Schema({
  clientName: { type: String, required: true },
  vendorCode: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

// Purchase Order Schema
const purchaseOrderSchema = new Schema({
  clientName: { type: String, required: true },
  consultant: { type: String, required: true },
  poNumber: { type: String, required: true },
  poIssueDate: { type: Date, required: true },
  poEndDate: { type: Date, required: true },
  entryDate: { type: Date, required: true },
});

// Visa Details Schema
const visaDetailsSchema = new Schema({
  clientName: { type: String, required: true },
  visaNumber: { type: String, required: true },
  sponsor: { type: String, required: true },
  consultantName: { type: String, required: true },
  visaEndDate: { type: Date, required: true },
  visaEntryDate: { type: Date, required: true },
});

// IQAMA Renewals Schema
const iqamaRenewalsSchema = new Schema({
  employeeName: { type: String, required: true },
  iqamaNumber: { type: String, required: true },
  expiryDate: { type: Date, required: true },
});

// Insurance Renewals Schema
const insuranceRenewalsSchema = new Schema({
  employeeName: { type: String, required: true },
  insuranceStartDate: { type: Date, required: true },
  insuranceEndDate: { type: Date, required: true },
  insuranceCompany: { type: String, required: true },
  insuranceCategory: { type: String, required: true },
  value: { type: String, required: true },
  employeeInsuranceValue: { type: String, required: true },
  spouseInsuranceValue: { type: String, required: false },  
  childrenInsuranceValues: [{ type: String, required: false }]
});

const houseRentalRenewalSchema = new Schema({
  houseOwnerName:{ type: String, required: true },
  location: { type: String, required: true },
  consultantName: { type: String, required: true },
  rentAmount: {type: String, required:true},
  startDate: { type: Date, required:true},
  endDate: {type: Date, required: true},
})

const FormData = mongoose.model<BaseFormData>('FormData', baseFormDataSchema);

FormData.discriminator('Agreements', agreementsSchema);
FormData.discriminator('Purchase Order', purchaseOrderSchema);
FormData.discriminator('Visa Details', visaDetailsSchema);
FormData.discriminator('IQAMA Renewals', iqamaRenewalsSchema);
FormData.discriminator('Insurance Renewals', insuranceRenewalsSchema);
FormData.discriminator('House Rental Renewal', houseRentalRenewalSchema);

export default FormData as Model<BaseFormData>;
