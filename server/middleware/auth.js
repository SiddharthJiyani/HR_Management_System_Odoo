const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
	try {
		// Extracting JWT from request cookies, body or header
		let token;
		
		if (req.cookies?.token) {
			token = req.cookies.token;
		} else if (req.body?.token) {
			token = req.body.token;
		} else if (req.header("Authorization")) {
			token = req.header("Authorization").replace("Bearer ", "");
		}

		// If JWT is missing, return 401 Unauthorized response
		if (!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		try {
			// Verifying the JWT using the secret key stored in environment variables
			const decode = await jwt.verify(token, process.env.JWT_SECRET);
			// Storing the decoded JWT payload in the request object for further use
			req.user = decode;
		} catch (error) {
			// If JWT verification fails, return 401 Unauthorized response
			return res
				.status(401)
				.json({ success: false, message: "Token is invalid" });
		}

		// If JWT is valid, move on to the next middleware or request handler
		next();
	} catch (error) {
		// If there is an error during the authentication process, return 401 Unauthorized response
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}
};

// Check if user is HR
exports.isHR = async (req, res, next) => {
	try {
		if (req.user.role !== "hr") {
			return res.status(403).json({
				success: false,
				message: "Access denied. HR role required.",
			});
		}
		next();
	} catch (error) {
		return res.status(500).json({ 
			success: false, 
			message: "User role can't be verified" 
		});
	}
};

// Check if user is Admin
exports.isAdmin = async (req, res, next) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({
				success: false,
				message: "Access denied. Admin role required.",
			});
		}
		next();
	} catch (error) {
		return res.status(500).json({ 
			success: false, 
			message: "User role can't be verified" 
		});
	}
};

// Check if user is HR or Admin
exports.isHRorAdmin = async (req, res, next) => {
	try {
		if (req.user.role !== "hr" && req.user.role !== "admin") {
			return res.status(403).json({
				success: false,
				message: "Access denied. HR or Admin role required.",
			});
		}
		next();
	} catch (error) {
		return res.status(500).json({ 
			success: false, 
			message: "User role can't be verified" 
		});
	}
};

// Check if user is Employee
exports.isEmployee = async (req, res, next) => {
	try {
		if (req.user.role !== "employee") {
			return res.status(403).json({
				success: false,
				message: "Access denied. Employee role required.",
			});
		}
		next();
	} catch (error) {
		return res.status(500).json({ 
			success: false, 
			message: "User role can't be verified" 
		});
	}
};