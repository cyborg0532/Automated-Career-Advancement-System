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
    },
    dashboardStats: {
        performance: {
            labels: { type: [String], default: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] },
            data: { type: [Number], default: [75, 78, 76, 81, 79, 82] }
        },
        grades: {
            labels: { type: [String], default: ['A', 'B', 'C', 'D', 'F'] },
            data: { type: [Number], default: [30, 40, 20, 7, 3] }
        },
        subjects: {
            labels: { type: [String], default: ['Data Structures', 'Algorithms', 'Database', 'OS', 'Networks'] },
            data: { type: [Number], default: [82, 75, 88, 79, 84] }
        },
        assessments: {
            labels: { type: [String], default: ['Exams', 'Quizzes', 'Assignments', 'Projects'] },
            data: { type: [Number], default: [35, 25, 25, 15] }
        }
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
