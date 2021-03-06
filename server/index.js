const express = require("express");

const bodyParser = require("body-parser");
const morgan = require('morgan');
const cors = require('cors');

const qs = require('qs');

const argon2 = require ('argon2'); 

const session = require("express-session");
const cookieParser = require('cookie-parser');
const mongoDBStore = require('connect-mongodb-session')(session);

const emailValidator = require('email-validator');

const db = require('./db/index');
const User = require('./db/user');
const Post = require('./db/post');

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
app.use(bodyParser.urlencoded({ extended: true })); // Support encoded bodies
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
    // CREATE USER
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

app.post('/post', (req, res) => {
    // CREATE POST
    if (!isEmpty(req.session.userId)) {
        // The request is done 'x-www-form-urlencoded'
        if (req.body.content !== undefined && req.body.content != "") {
            const post = new Post({
                authorId: req.session.userId,
                content: req.body.content,
                created: new Date(),
                upvotes: 0,
                downvotes: 0
            });
    
            post.save(e => {
                if(e) {
                    console.error(e);
                    res.status(500).send({
                        success: false,
                        message: "The content couldn't be posted."
                    });
                } else {
                    res.send({
                        success: true,
                        message: "The content has been posted correctly."
                    });
                }
            });
        } else {
            res.send({
                success: false,
                message: "There is no content in the request."
            })
        }
    } else {
        res.send({
            success: false,
            message: "The user is not authenticated.",
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
                    upvotes: user.upvotes,
                    downvotes: user.downvotes,
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
    // The user has changed page, the counter comes back to 0
    req.session.postsToSkip = 0;
});

app.get('/user/:id', (req, res) => {
    User.findById(req.params.id, (e, user) => {
        if (e) {
            console.error(e)
            res.send({
                success: false,
                message: e,
            });
        } else {
            res.send({
                username: user.username,
                email: user.email,
            });
        }
    });
});

app.get('/posts', (req, res) => {
    const limit = 5;
    if (req.session.postsToSkip == undefined)
        // The first time to request some posts from this session
        req.session.postsToSkip = 0;

    Post.aggregate([ {
            $lookup: {
                from: 'users',
                localField: "authorId",
                foreignField: "_id",
                as:  'user'
            }  
        }, 
        { $sort: { "created": -1 } },
        { $limit: req.session.postsToSkip + limit }, 
        { $skip: req.session.postsToSkip }])/*.skip(req.session.postsToSkip).limit(5)*/
        .then((posts) => {
            /**
             * Format:
             * [{
             *  _id: ObjectId(String),
             * authorId: ObjectId(String),
             * content: String,
             * created: Date,
             * upvotes: Number,
             * downvotes: Number,
             * __v: Number,
             * user: [{
             *      _id: ObjectId(String), --- Matches the authorId ---
             *      email: String,
             *      username: String,
             *      password: String,
             *      __v: 0 } 
             *   }] 
             * }, ...]
             * 
             * 100% there is a better way of doing this.
             */
            res.send({posts: posts });
        });
    // The next request skip the first 5 posts
    req.session.postsToSkip = 0;
    // TODO: =+ 5 when it's done
});

/**
 * PUT
 */
app.put('/post/:id', (req, res) => {
    Post.findById(req.params.id, (e, post) => {
        if (e) {
            console.error(e);
            res.status(500).send({
                success: false,
                message: "The post couldn't be updated."
            });
        } else {
            // If the PUT is on the votes, save it to the user's list
            if (post.upvotes > req.body.upvotes) {
                // The upvote was removed, so remove it from the list
                User.updateOne(
                    { _id: req.session.userId },
                    { $pull: { upvotes: req.params.id } }, 
                    e => {
                        if (e) {
                            console.error("Error in removing the post from the user's upvotes list");
                            res.status(500).send({
                                success: false,
                                message: "The post couldn't be updated."
                            });
                        }
                    }
                );
            } else if (post.upvotes < req.body.upvotes) {
                // The upvote was added, so add it to the list
                User.updateOne(
                    { _id: req.session.userId },
                    { $push: { upvotes: req.params.id } },
                    e => {
                        if (e) {
                            console.error("Error in adding the post to the user's upvotes list");
                            res.status(500).send({
                                success: false,
                                message: "The post couldn't be updated."
                            });
                        }
                    }
                );
            }
            // Not using 'else if' because can be modified both
            if (post.downvotes > req.body.downvotes) {
                // The downvote was removed, so remove it from the list
                User.updateOne(
                    { _id: req.session.userId },
                    { $pull: { downvotes: req.params.id } },
                    e => {
                        if (e) {
                            console.error("Error in removing the post to the user's downvotes list");
                            res.status(500).send({
                                success: false,
                                message: "The post couldn't be updated."
                            });
                        }
                    }  
                );
            } else if (post.downvotes < req.body.downvotes) {
                // The downvote was added, so add it to the list
                User.updateOne(
                    { _id: req.session.userId },
                    { $push: { downvotes: req.params.id } },
                    e => {
                        if (e) {
                            console.error("Error in adding the post to the user's downvotes list");
                            res.status(500).send({
                                success: false,
                                message: "The post couldn't be updated."
                            });
                        }
                    }
                );
            }
            
            // Update the post
            post.content = req.body.content;
            post.upvotes = req.body.upvotes;
            post.downvotes = req.body.downvotes;
            post.save(e => {
                if (e) {
                    console.error(e);
                    res.status(500).send({
                        success: false,
                        message: "The post couldn't be updated."
                    });
                } else {
                    res.send({
                        success: true,
                        message: "The post has been updated successfully."
                    });
                }
            });
        }
    });
});

app.listen(PORT, () => {
    console.log(`The server is listening on http://localhost:${PORT}.`);
});

function isEmpty(str) {
    return (!str || 0 === str.length || str == "undefined");
}