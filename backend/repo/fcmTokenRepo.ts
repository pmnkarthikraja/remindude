import FCMTokenModel, { FCMToken } from "../models/fcmTokenModel";

class FormDataRepository {
    async create(fcmTokenData: FCMToken): Promise<FCMToken> {
        const newTokenData = new FCMTokenModel({ ...fcmTokenData });
        return await newTokenData.save() as FCMToken;
    }

    async getAll(): Promise<FCMToken[]> {
        return await FCMTokenModel.find({}).exec();
      }

    async getByEmail(email:string): Promise<FCMToken | null> {
    return  await FCMTokenModel.findOne({email}).exec();
    }

    async removeToken(email: string | undefined, token: string): Promise<void> {
        if (email){
            await FCMTokenModel.updateOne(
                { email },
                { $pull: { tokens:token } }
            ).exec();
        }
    }
}

export default new FormDataRepository()