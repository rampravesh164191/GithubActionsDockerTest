const express = require("express");
const passport = require("passport");
const nodemailer = require("nodemailer");
const GitHubStrategy = require("passport-github2")
//JWT import
var jwt = require('jsonwebtoken');
//import start - bcrypt - from npm site
const bcrypt = require('bcrypt');
const UserModel = require("../models/user.model");
const BlacklistTokenModel = require("../models/blacklistToken.model");
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
//import end --bcrypt
const UserRouter = express.Router();

//swagger - @swagger or @openapi both will work
//i faced issue 
/**
 * @swagger
 * /users/signup:
 *   post:
 *     summary: User Signup
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Signup successful
 *       500:
 *         description: Signup failed
 */

 

//Signup
//client userName, password, email from req.body
//npm bycrypt helps to hash the password

UserRouter.post("/signup", async (req, res) => {
    try {
        const { userName, email, password, role } = req.body;
        //bcrypt (hash the password) -- npm install bcrypt
        //bcrypt - technique2 copy-paste
        //replace myPlaintextPassword to password
        bcrypt.hash(password, saltRounds, async function (err, hash) {
            // Store hash in your password DB.
            if (err) {
                res.status(500).json({ message: "hashing got wrong" })
            } else {
                console.log("rawpassword >", password, "hashed_password >", hash);
                //store this password in db along with other data
                await UserModel.create({ userName, email, password: hash, role })
                res.status(201).json({ msg: "Signup Success" });
            }
        });

    } catch (err) {
        res.status(500).json({ msg: "failed signup", err })
    }
})

//login
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signup login success
 *       500:
 *         description: Login failed
 */


UserRouter.post("/login", async (req, res) => {
    try {
        //check whether user is present or not
        //if no, send res as signup
        //if yes, compare the password
        //if comparison true, login success else wrong password
        const { email, password } = req.body;
        let user = await UserModel.findOne({ email });

        if (!user) {
            res.status(404).json({ msg: "user not found please signup" })
        } else {
            let hash = user.password; //hashed stored password
            bcrypt.compare(password, hash, function (err, result) {
                // result == true
                console.log(result);
                if (result) {
                    //genetate JWT and send it with a response
                    //user role should also be encrypted in the token to check in the middleware
                    //expires in 20 sec
                    var accessToken = jwt.sign({ userID: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: 1800 });
                    var refreshToken = jwt.sign({ userID: user._id, role: user.role }, process.env.JWT_SECRET_KEY, { expiresIn: 1800 });
                    res.status(200).json({ msg: "login success", accessToken, refreshToken })
                } else {
                    res.status(200).json({ msg: "wrong password" })
                }
            });
        }
    } catch (err) {
        res.status(500).json({ msg: "couldn't login", err })
    }
})

//github OAuth
//http://localhost:3000/users/auth/github ----------takes to authorization
passport.use(new GitHubStrategy({
    clientID: process.env.OAUTH_GITHUB_CLIENT_ID,
    clientSecret: process.env.OAUTH_GITHUB_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
},
    function (accessToken, refreshToken, profile, done) {
        console.log(profile, "profile from github")
        //done = next() 
        return done(null, profile)
    }
));

//calls gitub login and authorization
UserRouter.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] }));

//callback route incase of login success/failure
UserRouter.get('/auth/github/callback',
    // "/login" route we will create on app.js page
    //session:false - when connected to github will get redirected to login success
    passport.authenticate('github', { session: false, failureRedirect: '/login' }),
    async function (req, res) {
        console.log(req.user.id, "req.user.id");
        const githubUserId = req.user.id; //github id
        const user = await UserModel.find({ profileId: githubUserId })
        if (user.length == 0) {
            //user not found
            //store user into DB and generate token
            let newUser = await UserModel.create({ profileId: githubUserId })
            //generate new token
            var token = jwt.sign({ userID: newUser._id, role: newUser.role }, process.env.JWT_SECRET_KEY);
            res.json({ msg: "new user login success", token })
        } else {
            //user found so directly send a token
            var token = jwt.sign({ userID: user._id, role: user.role }, process.env.JWT_SECRET_KEY);
            // console.log(token);
            res.status(200).json({ msg: "existing user login success", token })
        }
    });

//nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GOOGLE_APP_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
    },
});

UserRouter.get("/sendemail", async (req, res) => {
    try {
        console.log("Email:", process.env.GOOGLE_APP_EMAIL);
        console.log("Password exists:", !!process.env.GOOGLE_APP_PASSWORD);

        const info = await transporter.sendMail({
            from: `"Rampravesh" <${process.env.GOOGLE_APP_EMAIL}>`,
            to: "rampravesh9991@gmail.com",
            subject: "This is test email sent",
            text: "Hello world?",
            html: "<b>Hello world?</b>",
        });

        res.status(201).json({ msg: "Email sent", info });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Failed to send email", error: err.message });
    }
});


UserRouter.post("/forget-password", async (req, res) => {
    //it will generate a link you have to click on it for the next process
    //1. do the forgot password with email
    //2. click on the generated link
    //3. post reqest send raw data of "newPassword"
    try {
        const { email } = req.body;
        //check whether the user is present in DB
        let user = await UserModel.findOne({ email });
        if (!user) {
            res.status(404).json({ msg: "user not found" })
        } else {
            //user found
            //need to send a reset password link to the email
            //link should not easily decodabel
            //use token? it will hide user id
            //localhost:3000/users/reset-password?token=sdkjwf
            //general expiry time : 20-30minutes
            let resetToken = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: 120 });
            let resetPasswordLink = `http://localhost:3000/users/reset-password?token=${resetToken}`;
            await transporter.sendMail({
                from: `"Rampravesh" <${process.env.GOOGLE_APP_EMAIL}>`,
                to: user.email,
                subject: "password reset link",
                html: `<p>dear ${user.userName}, here is the password reset link</p>
                       <h4>${resetPasswordLink}</h4>`,
            });
            //now you will receive the link in the email as well as in the json
            //give original email in body
            res.json({ msg: "password reset link sent to registered email", link: resetPasswordLink })
        }
    } catch (err) {
        res.status(500).json({ mag: "error forget password", err })
    }
})
UserRouter.post("/reset-password", async (req, res) => {
    try {
        const { token } = req.query;
        const { newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ msg: "Token and new password required" });
        }

        // verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // find user
        const user = await UserModel.findById(decoded.userID);
        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

         // ⛔️ Blacklist the token so it can't be reused
        await BlacklistTokenModel.create({ token });

        // save in DB
        await user.save();

        res.json({ msg: "Password reset successful" });
    } catch (err) {
        res.status(400).json({ msg: "Invalid or expired token", err });
    }
});


module.exports = UserRouter;