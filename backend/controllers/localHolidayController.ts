
import { Request, Response } from "express";
import LocalHolidayModel, { LocalHolidayData } from '../models/LocalHolidayModel'
import mongoose from "mongoose";

class LocalHolidayController {
    public async getLocalHolidays(req: Request, res: Response): Promise<void> {
        try {
            const localHolidays = await LocalHolidayModel.find({})
            res.status(200).json({
                message: "successfully retrieved local holidays",
                success: true,
                localHolidays
            })
        } catch (err: any) {
            res.status(500).json({
                message: "Internal Server Error", success: false
            })
        }
    }
    public async deleteLocalHoliday(req:Request,res:Response):Promise<void>{
        try {
            const {_id}=req.params
            const objectId =new mongoose.Types.ObjectId(_id);

            const deleted = await LocalHolidayModel.deleteOne({_id:objectId})
            if (deleted.deletedCount>0){
                res.status(200).json({
                    message: "successfully local holiday deleted",
                    success: true,
                })
                return
            }
          
        } catch (err: any) {
            res.status(500).json({
                message: "Failed to delete local holiday", success: false
            })
        }
    }
    public async upsertLocalHolidays(req: Request, res: Response): Promise<void> {
        try {
            const {holidays} = req.body
            
            if (!Array.isArray(holidays)) {
                res.status(400).json({
                    message: "Invalid data format. 'holidays' should be an array.",
                    success: false,
                });
            }

            await Promise.all(holidays.map(async (holiday:LocalHolidayData) => {
                await LocalHolidayModel.findOneAndUpdate(
                    { iso_date: holiday.iso_date, holidayName: holiday.holidayName, region:holiday.region }, 
                    { $set: holiday }, 
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            }));
    
            res.status(200).json({
                message: "Successfully Local Holidays are Updated!",
                success: true,
            });
        } catch (err: any) {
            res.status(500).json({
                message: "An error occurred while upserting local holidays", success: false, error: err.message
            })
        }
    }
}

export default new LocalHolidayController()