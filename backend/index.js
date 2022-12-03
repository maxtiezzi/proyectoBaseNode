const dtInicio = new Date()
const http = require('http')
const express = require('express')
//const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const errorMiddleware = require('./middlewares/errors')
const cookieparser = require('cookie-parser')
const { ErrorHandler } = require('./utils/errorHandler')

// importo los controllers de cada clase
const UsuarioController = require('./controllers/usuarioController')


// cargo el archivo de configuracion
dotenv.config({ path: 'config/config.env' })

// creo el objeto webserver express
const app = express()

app.use(function (req, res, next) {
    // eslint-disable-next-line no-undef
    let dominiosPermitidos = process.env.DOMINIOS
    if (dominiosPermitidos.includes(req.headers.origin)) {
        res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
    }

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true)

    // Pass to next layer of middleware
    next()
})

// agrego el cookie parser
app.use(cookieparser())

// seteo los body parser para que los body no sean simplemente texto si no que sean objetos
app.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}))

// configuro para que la api use json
app.use(express.json({ limit: '50mb' }))
// seteo las rutas de los distinos objetos
app.use('/api/v1/Usuario', UsuarioController)

// Handle unhandled routes
app.all('*', (req, res, next) => {
    next(new ErrorHandler(`${req.originalUrl} route not found`, 404))
})

// Middleware to handle errors
app.use(errorMiddleware)

// creo e inicio el servidor
const server = http.createServer(app)
// eslint-disable-next-line no-undef
const puerto = process.env.API_PORT
server.listen(puerto)


console.log('Iniciado (' + Math.round((new Date() - dtInicio) / 1000) + 's) en el puerto ' + puerto)

// Handling Unhandled Promise Rejection
// eslint-disable-next-line no-undef
process.on('unhandledRejection', err => {
    console.log(`Error: ${err.message}`)
    console.log('Shutting down the server due to Unhandled promise rejection.')
    server.close(() => {
        // eslint-disable-next-line no-undef
        process.exit(1)
    })
})