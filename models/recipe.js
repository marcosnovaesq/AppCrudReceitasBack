const mongoose = require('mongoose')

const RecipeSchema = new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user',
        required: true
    },
    nome: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        required: true
    },
    rendimento: {
        type: Number,
        required: true
    },
    tempo: {
        type: Number,
        required: true
    },
    dificuldade: {
        type: Number,
        required: true
    },
    ingredientes: {
        type: [String],
        required: true
    },
    passos: {
        type: [String],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("recipe", RecipeSchema)

