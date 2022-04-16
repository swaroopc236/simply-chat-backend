const User = require('./model');
const {OAuth2Client} = require('google-auth-library');
const bcrypt = require('bcrypt');
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
                    console.log('Succesful login');
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
                    
                });
                newUser.save();
            }
            return res.status(200).json({
                userData: userData
            });
        }
    });
}

exports.getUserByEmailId = (req, res) => {
    const emailId = req.body.emailId;
    User.find({email: emailId}, (err, doc) => {
        if(err) {
            console.error('\x1b[31m%s\x1b[0m', err);
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