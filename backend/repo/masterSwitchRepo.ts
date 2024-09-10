import MasterControllSchema, { MasterControllerModel } from "../models/MasterControllModels";
import { DBErrInternal } from "../utils/handleErrors";

interface MasterSwitchRepoImplementation {
    Toggle: (masterSwitchModel: MasterControllerModel) => Promise<MasterControllerModel>
    GetMasterSwitchData: (email:string) => Promise<MasterControllerModel|null>
}

class MasterSwitchRepo implements MasterSwitchRepoImplementation{
    async Toggle (masterSwitchModel: MasterControllerModel): Promise<MasterControllerModel>{
        try{
            const masterSwitchDoc = await MasterControllSchema.findOneAndUpdate({email:masterSwitchModel.email},{...masterSwitchModel},{ upsert: true, new: true, setDefaultsOnInsert: true})
            return masterSwitchDoc
        }catch(err:any){
           throw new DBErrInternal('Internal Server Error')
        } 
    }

    async GetMasterSwitchData (email:string): Promise<MasterControllerModel|null>{
        try{
            return await MasterControllSchema.findOne({email})
        }catch(err:any){
           throw new DBErrInternal('Internal Server Error')
        } 
    }
}

export default new MasterSwitchRepo()