const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
        unique: true,
        trim: true
    },
    firstName: {
        type: String,
        default: "",
        trim: true
    },
    lastName: {
        type: String,
        default: "",
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['employee', 'hr' , `admin`],
        default: 'employee',
        required: [true]
    },
    profilePhoto: {
        type: String,
        default: "https://t4.ftcdn.net/jpg/05/49/98/39/240_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg"
    },
    cgpa: {
        type: Number,
        default: 0
    },
    department: {
        type: String,
    },
    semester: {
        type: Number,
    },
    favorites: {
        type: [String],
        default: []
    },
    token:{
        type: String
    }


}, {
    timestamps: true
});


const User = mongoose.model('User', userSchema);
module.exports = User;