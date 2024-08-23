import { Document } from "mongodb";
import mongoose, { Schema } from "mongoose";


export interface ICalenderHoliday extends Document {
    name: string;
    description: string;
    country: {
        id: string;
        name: string;
    };
    date: {
        iso: string;
        datetime: {
            year: string;
            month: string;
            day: string;
        };
    };
    type: string[];
    urlid: string;
    primary_type: string;
}

export interface IHolidayData extends Document {
    country: string;
    year: number;
    holidays: ICalenderHoliday[];
}



const CalenderHolidaySchema: Schema<ICalenderHoliday> = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    country: {
        id: { type: String, required: true },
        name: { type: String, required: true }
    },
    date: {
        iso: { type: String, required: true },
        datetime: {
            year: { type: String, required: true },
            month: { type: String, required: true },
            day: { type: String, required: true }
        }
    },
    type: [{ type: String, required: true }],
    urlid: { type: String, required: true },
    primary_type: { type: String, required: true }
}, { timestamps: true });


const HolidayDataSchema: Schema<IHolidayData> = new Schema({
    country: { type: String, required: true },
    year: { type: Number, required: true },
    holidays: [CalenderHolidaySchema]
}, { timestamps: true });

// const CalenderHolidayModel = mongoose.model<ICalenderHoliday>('CalenderHoliday', CalenderHolidaySchema);
const HolidayDataModel = mongoose.model<IHolidayData>('HolidayData', HolidayDataSchema);


// export default CalenderHolidayModel;
export default HolidayDataModel;
