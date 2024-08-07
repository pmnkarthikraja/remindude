require('dotenv').config();
import jwt from 'jsonwebtoken';

const TOKEN_KEY:string=process.env.TOKEN_KEY||''

const createJSONWebToken = (id:any)=>{
return jwt.sign({id},TOKEN_KEY,{
    expiresIn: 1*24*60*60
})
}

export default createJSONWebToken