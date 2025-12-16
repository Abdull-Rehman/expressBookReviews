const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
	try{
		const authorization = req.session.authorization;
		if(!authorization){
			return res.status(401).json({message: "User not logged in"});
		}
		const token = authorization.accessToken;
		if(!token){
			return res.status(401).json({message: "Access token missing"});
		}
		jwt.verify(token, 'access', (err, decoded) =>{
			if(err){
				return res.status(401).json({message: "Invalid access token"});
			}
			req.user = decoded;
			next();
		})
	}catch(err){
		return res.status(500).json({message: "Authentication error"});
	}
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
