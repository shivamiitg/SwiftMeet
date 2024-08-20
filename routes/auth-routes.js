// const router = require("express").Router();
// const passport = require('passport');

// router.get('/login', (req,res)=>{
//     res.render('login');
// })

// router.get('/google', passport.authenticate('google', {
//     scope: ['profile']
// }));

// router.get('/logout', (req,res)=>{
//     res.send("logging out");
// })

// var username = "xyz";
// router.get('/google/redirect', passport.authenticate('google'), (req,res)=>{
//     // res.render('room', {roomId: req.params.room, user: req.user});
//     username = req.user.username;
//     console.log(username);
//     res.redirect('/room/');
//     // res.redirect('/home');
//     // res.send("Welcome " + req.user.username);
//     // res.send(req.user);
// })


module.exports = {user: username, router};
// module.exports = router;

// module.exports = {
//     mongodb: {
//         dbURL: 'mongodb+srv://dezyl:dpssolanki@cluster0.afvqfmr.mongodb.net/?retryWrites=true&w=majority'
//     },
//     session: {
//         cookieKey: 'GMEET BRO'
//     }
// }