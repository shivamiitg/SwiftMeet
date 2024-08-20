const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/user-model')

passport.serializeUser((user, done) => {
    done(null, user.id);
})

passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    })
})

passport.use(
    new GoogleStrategy({
        //clientID:"697265471528-5kgc28db7f3cukjcg2rqbh44sduutiqg.apps.googleusercontent.com", 
        //clientSecret:"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", 
        //callbackURL:"/auth/google/redirect",
    },  (accessToke, refreshToken, profile, done) => {
        // console.log("Hi " + profile.displayName) 
        User.findOne({googleId: profile.id}).then((currentUser) => {
            if(currentUser){
                console.log("user is " + currentUser);
                done(null, currentUser);
            } else {
                new User({
                    username: profile.displayName,
                    googleId: profile.id,
                }).save().then((newUser) => {
                    console.log("new user created" + newUser);
                    done(null, newUser);
                })
            }
        })
    })
)