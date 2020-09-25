const express = require('express')
const router = express.Router()
const Recipe = require('../../models/recipe')
const User = require('../../models/user')
const { body, validationResult } = require('express-validator')
const auth = require('../../middleware/auth')

//pega todas as receitas
router.get('/', [auth], async (req, res) => {
    try {
        const recipes = await Recipe.find({})
        if (recipes.length > 0) {
            res.status(200).json(recipes)
        }
        else {
            res.status(400).send({ "erro": "nao tem receitas" })
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).send({ "Erro::": error.message })
    }
})


//pega receita especifica
router.get('/:id', [auth], async (req, res, next) => {
    try {
        const receita = await Recipe.findById(req.params.id)
        if (receita) {
            const user = await User.findById(receita.user).select('_id nome email')
            receita["user"] = user
            res.status(200).json(receita)
        }
        else {
            res.status(404).send({ "Erro:": "receita nao encontrada" })
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).send({ "Erro::": error.message })
    }
})




//cria receita nova
router.post('/new', [
    body("nome").not().isEmpty().withMessage("não tem nome!"),
    body("tipo").not().isEmpty().withMessage("não tem tipo!"),
    body("rendimento").toInt().not().isEmpty().withMessage("é preciso informar um rendimento em porçoes!"),
    body("tempo").toInt().not().isEmpty().withMessage("é preciso informar um tempo da receita em minutos!"),
    body("dificuldade").toInt().not().isEmpty().withMessage("é preciso informar a dificuldade da receita!"),
    body("ingredientes")
        .not().isEmpty().withMessage("tem que ter pelo menos um ingrediente!"),
    body("passos")
        .not().isEmpty().withMessage("tem que ter pelo menos um passo!"),
    auth
], async (req, res) => {
    try {
        const erros = validationResult(req)
        if (!erros.isEmpty()) {
            return res.status(400).json({ erros: erros.array() })
        }

        const { user, nome, tipo, rendimento, tempo, dificuldade, ingredientes, passos } = req.body
        let recipe = new Recipe({ user, nome, tipo, rendimento, tempo, dificuldade, ingredientes, passos })
        console.log(recipe)
        await recipe.save()
        res.send(recipe)
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ "Erro::": error.message })
    }

})


//deleta receita
router.delete("/:id", [auth], async (req, res) => {
    try {
        const receitaDeletada = await Recipe.findByIdAndDelete(req.params.id)
        if (receitaDeletada) {
            res.status(200).json(receitaDeletada)
        }
        else {
            res.status(400).send({ "Erro": "não foi possivel achar a receita" })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ "Erro::": error.message })
    }
})

// //edita receita com put
// router.put("/:id", (req, res, next) => {
//     try {
//         // let usuarioEditado = listaUsuarios.filter(u => u.id == req.params.id)
//         // if (usuarioEditado.length > 0) {
//         //     const { nome, email, senha, isActive, isAdmin } = req.body
//         //     usuarioEditado = usuarioEditado[0]
//         //     usuarioEditado.nome = nome
//         //     usuarioEditado.email = email
//         //     usuarioEditado.senha = senha
//         //     usuarioEditado.isActive = isActive
//         //     usuarioEditado.isAdmin = isAdmin
//         //     res.status(200).send(usuarioEditado)

//         // }
//         // else {
//         //     res.status(400).send({ "Erro::": "usuario nao existe" })
//         // }
//     } catch (error) {
//         console.log(error.message)
//         res.status(500).send({ "Erro::": error.message })
//     }

// })

//edita receita com patch
router.patch('/:id', [
    body("nome").optional().not().isEmpty().withMessage("não tem nome!"),
    body("tipo").optional().not().isEmpty().withMessage("não tem tipo!"),
    body("rendimento").optional().toInt().not().isEmpty().withMessage("é preciso informar um rendimento em porçoes!"),
    body("tempo").optional().toInt().not().isEmpty().withMessage("é preciso informar um tempo da receita em minutos!"),
    body("dificuldade").optional().toInt().not().isEmpty().withMessage("é preciso informar a dificuldade da receita!"),
    body("ingredientes").optional()
        .isArray().withMessage("nao esta no formato array")
        .not().isEmpty().withMessage("tem que ter pelo menos um ingrediente!"),
    body("passos").optional()
        .isArray().withMessage("nao esta no formato array")
        .not().isEmpty().withMessage("tem que ter pelo menos um passo!"),
    auth
], async (req, res, next) => {
    try {

        const erros = validationResult(req)
        if (!erros.isEmpty()) {
            res.status(400).send(erros.array())
        }

        const update = req.body
        const recipeEditada = await Recipe.findByIdAndUpdate(req.params.id, update, { new: true })
        if (recipeEditada) {
            res.status(200).json(recipeEditada)
        }
        else {
            res.status(400).send({ "Erros:": "receita nao encontrada" })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ "Erro::": error.message })
    }
})

module.exports = router