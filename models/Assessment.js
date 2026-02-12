const mongoose = require('mongoose');

const AssessmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Upcoming', 'In Progress', 'Completed'],
        default: 'Upcoming'
    },
    avgScore: {
        type: Number,
        default: 0
    },
    studentCount: {
        type: Number,
        default: 0
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Assessment', AssessmentSchema);
