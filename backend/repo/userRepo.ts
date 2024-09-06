import { MongoError } from 'mongodb';
import UserSchema, { UserModel } from '../models/UserModel';
import { DBErrInternal, DBErrTaskNotFound, DBErrUserAlreadyExist, DBErrUserNotFound } from '../utils/handleErrors';

interface UserRepo {
    findOneByEmail: (email: string) => Promise<UserModel | null>;
    findOneById: (id: string) => Promise<UserModel | null>;
    SignUp: (user: UserModel) => Promise<UserModel>;
    UpdateUser: (email: string, userName: string, profilePicture: string, isProfilePicSet: string) => Promise<UserModel | null>;
    ResetPassword: (email: string, password: string) => Promise<UserModel | null>
    DeleteUser:(email:string) => Promise<void>
}

class UserRepoClass implements UserRepo {
    async findOneByEmail(email: string, googleId?: string): Promise<UserModel | null> {
        let query = {};
        if (email && googleId) {
            query = { $or: [{ email }, { googleId }] };
        } else if (email) {
            query = { email };
        } else if (googleId) {
            query = { googleId };
        }
        return await UserSchema.findOne(query)
    }

    async findOneById(id: string): Promise<UserModel | null> {
        return await UserSchema.findById(id)
    }

    async SignUp(user: UserModel): Promise<UserModel> {
        try {
            const userDoc = await UserSchema.create(user)
            return await userDoc.save()
        } catch (err: any) {
            const e: MongoError = err
            if (e.code == 11000) {
                throw new DBErrUserAlreadyExist()
            } else {
                throw new DBErrInternal('DB Error')
            }
        }
    }

    async UpdateUser(email: string, userName: string, profilePicture: string, isProfilePicSet: string): Promise<UserModel | null> {
        try {
            if (isProfilePicSet == 'notset') {
                const gotUser = await UserSchema.findOneAndUpdate({ email }, {
                    userName,
                })
                return gotUser
            }
            const gotUser = await UserSchema.findOneAndUpdate({ email }, {
                userName,
                profilePicture
            })
            return gotUser
        } catch (e) {
            throw new DBErrInternal('DB Error')
        }
    }
    async ResetPassword(email: string, password: string): Promise<UserModel | null> {
        try {
            const gotUser = await UserSchema.findOneAndUpdate({ email }, {
                $set: { password }
            }, { new: true })
            return gotUser
        } catch (e) {
            throw new DBErrInternal('DB Error')
        }
    }

    async ValidatePassword(email: string, password: string): Promise<UserModel | null> {
        try {
            const gotUser = await UserSchema.findOneAndUpdate({ email }, {
                $set: { password }
            }, { new: true })
            return gotUser
        } catch (e) {
            throw new DBErrInternal('DB Error')
        }
    }

    async DeleteUser(email:string):Promise<void>{
        console.log("deleting user: ",email)
        try{
            const res = await UserSchema.deleteOne({email})
            if (res.deletedCount<1){
                throw new DBErrUserNotFound()
            }
        }catch(e){
            throw new DBErrInternal('DB Error')
        }
    }
}

export default new UserRepoClass()


