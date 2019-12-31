const express = require("express");

const bodyParser = require("body-parser");
const morgan = require('morgan');
const cors = require('cors');

const argon2 = require ('argon2'); 

const session = require("express-session");
const cookieParser = require('cookie-parser');
const mongoDBStore = require('connect-mongodb-session')(session);

const emailValidator = require('email-validator');

const db = require('./db/index');
const User = require('./db/user');

const {
    PORT = 4000,
    SESS_NAME = 'sid',
    SESS_SECRET = 'secret', // TODO: Strong value

    ORIGIN = 'http://localhost:8080',
    DB = 'mongodb://localhost:27017'
} = process.env;

db.connect();

const app = express();

app.use(cookieParser());
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(cors({
    origin: ORIGIN,
    credentials: true,
}));

const store = new mongoDBStore({
    uri: DB + '/test',
    collection: 'sessions'
});

store.on('error', e => {
    console.error(e);
});

app.use(session({
    name: SESS_NAME,
    secret: SESS_SECRET,

    resave: false,
    saveUninitialized: false,
    
    store: store,

    cookie: {
        maxAge: 1000 * 60 * 60, // 1 hour
        sameSite: 'none', // true would be better but we're not using the same server and client
        secure: false,
    }
}));

/**
 * This middleware tests if the user is already authenticated.
 * If he is, it lets the client know. If he isn't, next().
 * 
 * @param { Request<ParamsDictionary, any, any> } req Request to the server
 * @param { Response<any> } res Response of the server
 * @param { Next<any> } next Next function to call
 */
const auth = (req, res, next) => {
    if (!isEmpty(req.session.userId)) {
        res.send({
            success: true,
            message: "The user is already authenticated."
        });
    } else 
        next();
}

/**
 * POST
 */
app.post('/auth/login', auth, (req, res) => {
    console.log(req.body);

    const username = req.body.username;
    const password = req.body.password;

    if (!isEmpty(username) && !isEmpty(password)) {
        // Find a user with this username
        User.findOne({ "username": username }, async (e, user) => {
            try {
                if (!user) {
                    console.error(e);
                    res.send({
                        success: false,
                        message: "This username doesn't exist."
                    });
                } else {
                    if (await argon2.verify(user.password, password)) {
                        req.session.userId = user._id;
                        
                        res.send({
                            success: true,
                            message: "The user is authenticated."
                        });
                    } else {
                        res.send({
                            success: false,
                            message: "The password for this username is wrong."
                        })
                    }
                }
            } catch (ex) {
                console.error(ex);
                res.status(500).send({
                    success: false,
                    message: "Something's wrong."
                });
            }
        });
    } else {
        res.send({
            success: false,
            message: "Insert valid credentials."
        });
    }
});

app.post('/auth/signup', auth, async (req, res) => {
    // CREATE 
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;

    // TODO: Control that the username is unique
    if (emailValidator.validate(email) && !isEmpty(username) && !isEmpty(password)) {
        try {
            const hash = await argon2.hash(password);
            
            const user = new User({
                email: email,
                username: username,
                password: hash
            });

             // Insert the user into the database
            user.save(e => {
                if (e) {
                    console.error(e);
                    res.status(500).send({
                        success: false,
                        message: "The user couldn't be saved."
                    });
                } else {
                    req.session.userId = user._id;
                    res.send({
                        success: true,
                        message: "User saved correctly."
                    });
                }
            });
        } catch (e) {
            console.error(e);
            res.status(500).send({
                success: false,
                message: "The password couldn't be hashed."
            });
        }
    } else {
        res.send({
            success: false,
            message: "Insert valid credentials."
        })
    }
});

/**
 * GET
 */
app.get('/auth/logout', (req, res) => {
    req.session.destroy();
    res.send({
        success: true,
        message: "The user has been logged out."
    })
});

app.get('/session', (req, res) => {
    if (req.session.userId)
        res.send({
            sessionInitialized: true,
        });
    else 
        res.send({
            sessionInitialized: false,
        });
});

app.get('/user', (req, res) => {
    if (!isEmpty(req.session.userId)) {
        // Using Mongoose; should sanitize the input
        const userId = new db.ObjectId(req.session.userId);
        User.findOne({ "_id": userId }, (e, user) => {
            if (user) {
                const user_response = {
                    email: user.email,
                    username: user.username,
                };
                res.status(200).send(user_response);
            } else
                res.status(404).send({
                    success: false,
                    message: "User not found.",
                })
        });
    } else {
        res.status(401).send({
            success: false,
            message: "The user isn't authenticated.",
        })
    }
});

app.listen(PORT, () => {
    console.log(`The server is listening on http://localhost:${PORT}.`);
});

function isEmpty(str) {
    return (!str || 0 === str.length || str == "undefined");
}