const express = require("express");
require("dotenv").config();
const app = express();
const cors = require("cors");
const database = require('./config/database');
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 4000;

// Middleware
app.use(cookieParser());
app.use(express.json()); 

// CORS configuration
const corsOptions = {
    origin: "http://localhost:3000", // Replace with your frontend URL
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Connecting to database
database.connectDB();

// Routes
const userRoutes = require("./routes/user");

app.use("/api/auth", userRoutes);


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
