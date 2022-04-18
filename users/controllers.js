const User = require('./model');
const {OAuth2Client} = require('google-auth-library');
const bcrypt = require('bcrypt');
const {v4: uuid} = require('uuid');

const client = new OAuth2Client(process.env.WEB_CLIENT_ID);

const saltRounds = 10;

exports.getUsers = async (req, res) => {
    try {
        const result = await User.find();
        return res.status(200).json(result);
    } catch(err) {
        console.error(err);
        return res.status(500).json({
            error_msg: 'Something went wrong while fetching users',
            error: err
        })
    }
}

exports.signInUser = async (req, res) => {
    const authHeader = req.headers.authorization;
    const userData = req.body.userData;

    const authType = req.body.authType;
    const emailId = req.body.emailId;
    const password = req.body.password;

    let id_token = '';
    let authenticatedUserData = {};

    if(authHeader && authHeader.startsWith('Bearer ')) {
        id_token = authHeader.substring(7);
    }

    authenticatedUserData.email = emailId;

    if(authType == 'google-oauth') {
        try {
            const ticket = await client.verifyIdToken({
                idToken: id_token,
                audience: process.env.WEB_CLIENT_ID
            });
            const payload = ticket.getPayload();
            
            authenticatedUserData.email = payload.email;
            authenticatedUserData.auth_displayname = payload.name;
            authenticatedUserData.auth_id = payload.sub;
        } catch(err) {
            console.error(err);
            return res.status(200).json({
                error_msg: 'Token validation failed'
            })
        }
    }

    // User.findOne({auth_id: authenticatedUserData.sub}, (err, doc) => {
    User.findOne({email: authenticatedUserData.email}, async (err, doc) => {
        if(err) {
            console.error('\x1b[31m%s\x1b[0m', err);
            return res.status(500).json({
                error_msg: 'Could not sign in'
            });
        } else {
            //for email and pwd type signin
            if(doc && authType == 'email-pwd') {
                authenticatedUserData = doc;
                console.log(authenticatedUserData);
                console.log(password, authenticatedUserData.pwd);
                const validatedPassword = await bcrypt.compare(password, authenticatedUserData.pwd);
                if(validatedPassword) {
                    console.log('Succesfull login');
                    return res.status(200).json({
                        userData: authenticatedUserData
                    })
                }
                return res.status(401).json({
                    error_msg: 'Invalid Credentials'
                })
            }
            if(!doc && authType != 'email-pwd') {
                const newUser = new User({
                    email: authenticatedUserData.email,
                    auth_displayname: authenticatedUserData.name,
                    app_displayname: "",
                    auth_type: authType,
                    auth_id: authenticatedUserData.auth_id,
                    display_picture_url: "",
                });
                newUser.save();
            }
            return res.status(200).json({
                userData: userData
            });
        }
    });
}

exports.signUpUser = async (req, res) => {
    const emailId = req.body.emailId;
    const password = req.body.password;
    const authType = req.body.authType;

    User.findOne({email: emailId}, async (err, doc) => {
        if(err) {
            console.error(err);
            return res.status(500).json({
                error_msg: 'Could not register'
            });
        }
        if(doc) {
            // console.log('Email already registered', doc);
            return res.status(403).json({
                error_msg: 'Email is already registered'
            });
        }
        const authId = uuid();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            email: emailId,
            pwd: hashedPassword,
            auth_displayname: "",
            app_displayname: "",
            auth_type: authType,
            auth_id: authId,
            display_picture_url: "",
            isEmailVerified: false,
        });
        const savedUser = await newUser.save();
        if(!savedUser) {
            console.error('Could not create new user', err);
            return res.status(500).json({
                error_msg: 'Could not sign up'
            }); 
        }
        return res.status(201).json({
            msg: 'User registered',
            userData: savedUser
        })
    });
}

exports.getUserByEmailId = (req, res) => {
    const emailId = req.body.emailId;
    User.find({email: emailId}, (err, doc) => {
        if(err) {
            console.error(err);
            return res.status(500).json({
                error_msg: 'Something went wrong'
            });
        }
        // console.log(doc);
        return res.status(200).json({
            data: doc
        });
    });
}