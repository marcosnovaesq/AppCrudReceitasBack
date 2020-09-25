const express = require('express')
const { body, param, validationResult } = require('express-validator')
const router = express.Router()
const Profile = require('../../models/profile')
const auth = require('../../middleware/auth')

//pega todos perfis
router.get('/', [auth], async (req, res) => {
    try {
        const profiles = await Profile.find({})
        if (profiles.length > 0) {
            res.status(200).json(profiles)
        }
        else {
            res.status(400).send({ "erro": "nao tem perfis" })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ "Erro::": error.message })
    }
})


//pega perfil especifico
router.get('/:id', [auth], async (req, res) => {
    try {
        const profile = await Profile.find({ _id: req.params.id })
        if (profile.length == 0) {
            res.status(404).send({ "Erro": "este perfil nao existe" })
        }
        else {
            res.status(200).json(profile[0])
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ "Erro::": error.message })
    }
})




//cria perfil novo
router.post('/new', [
    body('bio').not().isEmpty().withMessage('É necessario preencher a bio'),
    body('location').not().isEmpty().withMessage('É necessario dizer de onde voce é'),
], async (req, res) => {
    const { user, bio, location, skills } = req.body
    try {
        const erros = validationResult(req)
        if (!erros.isEmpty()) {
            res.status(400).json({ erros: erros.array() })
        }
        else {
            let usuario = new User({ nome, telefone, senha, email, isActive, isAdmin })
            const salt = await bcrypt.genSalt(10)
            usuario.senha = await bcrypt.hash(senha, salt)
            await usuario.save()
            if (usuario.id) {
                console.log("usuario criado e inserido no banco")
                res.status(201).json(usuario)
            }
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ "Erro::": error.message })
    }

})


//deleta usuario
router.delete("/:email", [
    param("email").isEmail().withMessage("email a ser procurado nao esta em formato valido")
], async (req, res) => {
    try {
        const erros = validationResult(req)
        if (!erros.isEmpty()) {
            return res.status(400).send({ "erros": erros.array() })
        }
        const user = await User.findOneAndDelete({ "email": req.params.email })
        if (user) {
            res.status(200).json(user)
        }
        else {
            res.status(404).send({ "erro": "usuario nao encontrado" })
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ "Erro::": error.message })
    }
})

//edita usuario com put
router.put("/:id", [
    body("nome", "nome é necessario ").not().isEmpty(),
    body("telefone", "telefone é necessario com ddd no formato xx9yyyyyyyy").not().isEmpty(),//.isMobilePhone({ options: ['pt-BR'] }),
    body("senha")
        .isLength({ min: 6, max: 10 }).withMessage("tem que ter pelo menos 6 e no maximo 10 caracteres")
        .matches(/\d/).withMessage("tem que ter pelo menos um numero"),
    body("senhaConfirmacao").custom((senhaConfirmacao, { req }) => {
        if (senhaConfirmacao !== req.body.senha) {
            throw new Error("senhas precisam ser iguais")
        }
        return true;
    }),
    body("email")
        .isEmail().withMessage("email é necessario no formato xxx@yyy.zzz")
], async (req, res) => {
    try {
        const erros = validationResult(req)
        if (!erros.isEmpty()) {
            return res.status(400).json({ erros: erros.array() })
        }

        const { nome, telefone, email, senha, isActive, isAdmin } = req.body
        const valueUpdate = { nome, telefone, email, senha, isActive, isAdmin }
        const salt = await bcrypt.genSalt(10)
        valueUpdate.senha = await bcrypt.hash(senha, salt)

        const usuarioEditado = await User.findOneAndReplace({ _id: req.params.id }, valueUpdate, { new: true })
        if (usuarioEditado) {
            res.status(200).json(usuarioEditado)
        }
        else {
            res.status(500).send({ "Erro:::": " erro ao atualizar usuario" })
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).send({ "Erro::": error.message })
    }

})

//edita usuario com patch
router.patch('/:email', [
    body("senha")
        .optional()
        .isLength({ min: 6, max: 10 }).withMessage("tem que ter pelo menos 6 e no maximo 10 caracteres")
        .matches(/\d/).withMessage("tem que ter pelo menos um numero"),
    body("senhaConfirmacao")
        .if(body('senha').exists())
        .custom((senhaConfirmacao, { req }) => {
            if (senhaConfirmacao !== req.body.senha) {
                throw new Error("senhas precisam ser iguais")
            }
            return true;
        }),
    body("email")
        .optional()
        .isEmail().withMessage("email é necessario no formato xxx@yyy.zzz")
        .bail()
        .custom(async (email, { req }) => {
            const userExist = await User.find({ "email": email })
            if (email == req.params.email) {
                throw new Error("este ja e seu email")
            }
            if (userExist.length > 0) {
                throw new Error("email ja cadastrado")
            }
            else {
                return true
            }
        }),
    param("email").custom(async (email) => {
        const emailExiste = await User.find({ "email": email })
        if (emailExiste.length === 0) {
            throw new Error("nao tem usuario com este email")
        }
        else {
            return true
        }
    })
], async (req, res) => {
    try {
        const erros = validationResult(req)
        if (!erros.isEmpty()) {
            return res.status(400).send({ "erros": erros.array() })
        }
        let bodyRequest = req.body
        if (bodyRequest.senha) {
            const salt = await bcrypt.genSalt(10)
            bodyRequest.senha = await bcrypt.hash(bodyRequest.senha, salt)
        }
        const user = await User.findOneAndUpdate({ "email": req.params.email }, bodyRequest, { new: true })
        res.status(200).send(user)
    } catch (error) {
        console.log(error.message)
        res.status(500).send({ "Erro::": error.message })
    }
})


module.exports = router