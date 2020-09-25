const mongoose = require('mongoose')

const ProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },
    bio: {
        type: String,
        required: true
    },
    skills: {
        type: [String]
    },
    location: {
        type: String,
        required: true
    }

}, { autoCreate: true })

module.exports = mongoose.model('profile', ProfileSchema)