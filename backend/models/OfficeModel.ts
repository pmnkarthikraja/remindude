import { Document, Model } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

// Base Interface for FormData


interface AssignedTo{
  email:string,
  reminderEnabled:boolean
}


export interface BaseFormData extends Document {
  id: string;
  email: string;
  category: 'Agreements' | 'Purchase Order' | 'Visa Details' | 'IQAMA Renewals' | 'Insurance Renewals' | 'House Rental Renewal';
  remarks?: string;
  wantsCustomReminders: boolean;
  customReminderDates: Date[];
  reminderDates: Date[];
  completed: boolean,
  assignedTo?: AssignedTo | undefined,  //example kannan, assigning task to karthik and deepika
  assignedBy?: string | undefined//email  // consider i am karthik, task assigned by kannan or undefined (if no one assigned me a task)
}



//example user 1 - kannan
// const testCase:BaseFormData={
// id:'',
// email:"kannan@gmail.com",
// category:'Agreements',
// completed:false,
// customReminderDates:[],
// wantsCustomReminders:false,
// reminderDates:[new Date()],
// remarks:'Manage Task With Karthik',
// assignedTo:
//   {
//     email:"pmnkarthikraja@gmail.com",
//     reminderEnabled:true,
//   },
// }

//do all this stuff in service layer
// coming to repo to save.
//check if the model is coming with assignedTo length > 1,
//1st save the model with user email kannan@gmail.com
//2nd iterate through assignedTo emails, 
//find email, then create a new model,
//after inserting , on service layer, we need to send push notification, 

// const newModel:BaseFormData={
//   ...testCase,
//   assignedBy:testCase.email,
//   email: 'pmnkarthikraja@gmail.com'// assignedTo[0],
// }



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
  startDate:Date;
  endDate:Date
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
  houseOwnerName: string,
  location: string,
  consultantName: string,
  startDate: Date,
  endDate: Date,
  rentAmount: string,
}

export type FormData = Agreements | PurchaseOrder | VisaDetails | IQAMARenewals | InsuranceRenewals | HouseRentalRenewal;



const assignedToSchema = new Schema<AssignedTo>({
  email: {type:String, required:true},
  reminderEnabled: { type:Boolean, required:true}
})


// Base schema with common fields
const baseFormDataSchema = new Schema<BaseFormData>({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Agreements', 'Purchase Order', 'Visa Details', 'IQAMA Renewals', 'Insurance Renewals', 'House Rental Renewal']
  },
  assignedTo: {
    type: assignedToSchema,
    required:false
  },
  assignedBy: {type:String,required:false},
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
  houseOwnerName: { type: String, required: true },
  location: { type: String, required: true },
  consultantName: { type: String, required: true },
  rentAmount: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
})

const FormData = mongoose.model<BaseFormData>('FormData', baseFormDataSchema);

FormData.discriminator('Agreements', agreementsSchema);
FormData.discriminator('Purchase Order', purchaseOrderSchema);
FormData.discriminator('Visa Details', visaDetailsSchema);
FormData.discriminator('IQAMA Renewals', iqamaRenewalsSchema);
FormData.discriminator('Insurance Renewals', insuranceRenewalsSchema);
FormData.discriminator('House Rental Renewal', houseRentalRenewalSchema);

export default FormData as Model<BaseFormData>;
