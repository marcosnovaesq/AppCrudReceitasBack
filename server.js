const PORT = 3001
//dependencias
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const connectDB = require('./config/db')
const app = express()

//conecta no banco
connectDB()




//init middleware
app.use(cors())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

//rotas
app.get('/', (req, res) => {
    res.send('pagina principal')
})
app.use('/users', require('./routes/api/user'))
// app.use('/profiles', require('./routes/api/profile'))
app.use('/recipes', require('./routes/api/recipe'))
app.use('/auth', require('./routes/api/auth'))


app.listen(PORT, () => console.log(`server rodando em http://localhost:${PORT}`))