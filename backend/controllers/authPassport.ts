import passport from  'passport'
import { Strategy as GoogleStrategy, StrategyOptionsWithRequest } from 'passport-google-oauth2';
import UserModel from '../models/UserModel';


//CURRENTLY PASSPPORT IS NOT IN USE.

//passport configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const strategyOptionsWithReq:StrategyOptionsWithRequest={
    clientID:     GOOGLE_CLIENT_ID || '',
    clientSecret: GOOGLE_CLIENT_SECRET || '',
    callbackURL: "http://localhost:4000/google/callback",
    passReqToCallback   : true
  }
  
  passport.use(new GoogleStrategy(strategyOptionsWithReq,
  async function(_request:any, _accessToken:any, _refreshToken:any, profile:any, done:any) {
    try{
        //check if user exist
        let existingUser = await UserModel.findOne({ $or: [{ googleId: profile.id }, { email: profile.emails[0].value }] });
        if (existingUser) {
            return done(null, existingUser);
          } else {
            let newUser = await UserModel.create({ googleId: profile.id, email: profile.emails[0].value, userName: profile.displayName });
            return done(null, newUser);
          }
    }catch(e){
        return done(e)
    }
  }
  ));
  
  //serialize the user
  passport.serializeUser(function(user,done){
  done(null,user)
  })
  
  //deserialize the user
  passport.deserializeUser(function(user:Express.User,done){
  done(null, user);
  })