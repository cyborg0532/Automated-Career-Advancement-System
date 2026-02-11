const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['Faculty', 'HOD', 'Student'],
        default: 'Faculty'
    },
    profileComplete: {
        type: Number,
        default: 0
    },
    profileData: {
        phone: String,
        department: String,
        experience: Number,
        specialization: String,
        qualification: String,
        employeeId: String,
        bio: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password before saving
// Encrypt password before saving
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
