const express = require('express')
const { check, body, param, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const config = require('config')
const router = express.Router()
const User = require('../../models/user')


router.post('/', [
    body("email").isEmail().withMessage("email tem que estar no formato xxx@abc.yyy"),
    body("senha").exists().withMessage("senha é obrigatória")
], async (req, res) => {
    try {
        const erros = validationResult(req)
        if (!erros.isEmpty()) {
            return res.status(400).json({ erros: erros.array() })
        }
        const { email, senha } = req.body
        //procurar usuario com esse email
        const user = await User.findOne({ email }).select('id email nome senha isActive isAdmin')
        if (!user) {
            return res.status(404).json({ erros: [{ param: 'email', msg: 'Usuario nao existe' }] })
        } else {
            const senhaCorreta = await bcrypt.compare(senha, user.senha)
            if (!senhaCorreta) {
                return res.status(400).json({ erros: [{ param: 'senha', msg: 'Senha esta incorreta' }] })
            }
            else {
                const payload = {
                    user: {
                        id: user.id,
                        nome: user.nome,
                        email: user.email,
                        isAdmin: user.isAdmin,
                        isActive: user.isActive
                    }
                }
                jwt.sign(
                    payload,
                    config.get('jwtSecret'),
                    { expiresIn: '5 days' },
                    (err, token) => {
                        if (err) throw err;
                        payload.token = token
                        return res.status(200).json(payload)
                    }
                )
            }
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).send({ "Erro:": "Server error" })
    }





})

module.exports = router