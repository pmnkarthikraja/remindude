
import { Request, Response } from "express";
import FCMTokenModel from '../models/fcmTokenModel'
import fcmRepo from "../repo/fcmTokenRepo";


class FCMTokenController {
    public async createFcmToken(req: Request, res: Response): Promise<void> {
        const { email, token } = req.body;

        console.log("email,token:",email,token)

        try {
            // check if the email already exists
            let fcmData = await FCMTokenModel.findOne({ email });

            console.log("got :",fcmData)

            if (fcmData) {
                if (!fcmData.tokens.includes(token)) {
                    fcmData.tokens.push(token);
                    await fcmData.save();
                }
            } else {
                fcmData = new FCMTokenModel({ email, tokens: [token] });
                await fcmData.save();
            }

            res.status(200).json({ message: 'FCM token saved successfully' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to save FCM token' });
        }
    }

    public async getAllFcmTokens(req: Request, res: Response): Promise<void> {
        try {
            const tokens =await fcmRepo.getAll()
            res.status(200).json({ message: 'FCM tokens retrieved successfully', tokens });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to retrieve FCM token' });
        }
    }

    public async getTokensByEmail(req: Request, res: Response): Promise<void> {
        const {email} = req.params
        try {
            const tokens =await fcmRepo.getByEmail(email)
            res.status(200).json({ message: 'FCM tokens retrieved for email successfully', tokens });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to retrieve FCM token for email' });
        }
    }
}

export default new FCMTokenController()