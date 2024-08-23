import { Document } from "mongodb";
import mongoose, { Schema } from "mongoose";


export interface LocalHolidayData extends Document{
    iso_date:string,
    holidayName:string,
    region:string
  }

const LocalHolidayDataSchema: Schema<LocalHolidayData> = new Schema({
    iso_date: { type: String, required: true },
    holidayName: { type: String, required: true },
    region: {type:String,required:true}
}, { timestamps: true });

const LocalHolidayDataModel = mongoose.model<LocalHolidayData>('LocalHolidayData', LocalHolidayDataSchema);


export default LocalHolidayDataModel;
