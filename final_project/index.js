const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
const PORT = 5000;
const SESSION_SECRET = "fingerprint_customer";
const JWT_SECRET = "access";

app.use(express.json());

// Use the session in customer routes to make a secure login
app.use("/customer",session({secret:SESSION_SECRET,resave: true, saveUninitialized: true}))

// middle ware to verify token
app.use("/customer/auth/*", function auth(req,res,next){

    const token = req.session.authorization?.accessToken;
    
    if (!token) {
        return res.status(403).json({ message: "User is not logged in." });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "User is not authenticated." });
        }
        
        req.user = user;
        next();
    });
    
});


app.use("/customer", customerRoutes);
app.use("/", generalRoutes);

app.listen(PORT,()=>console.log("Server is running on port ${PORT}"));
