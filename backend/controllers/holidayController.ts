
import { Request, Response } from "express";
import HolidayModel from '../models/HolidayModel'

class HolidayController {
    public async getHolidays(req: Request, res: Response): Promise<void> {
        try {
            const holidayData = await HolidayModel.find({})
            res.status(200).json({
                message: "successfully retrieved holidays",
                success: true,
                holidayData
            })
        } catch (err: any) {
            res.status(500).json({
                message: "Internal Server Error", success: false
            })
        }
    }
}

export default new HolidayController()