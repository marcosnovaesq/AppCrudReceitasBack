const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },
    recipe: {
        type: mongoose.SchemaTypes.ObjectId
    },
    description: {
        type: String
    }

}, { autoCreate: true })

module.exports = mongoose.model('comment', CommentSchema)