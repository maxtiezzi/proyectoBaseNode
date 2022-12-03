const Usuario = require('../models/usuario')
const Bcd = require('../models/bcd')
const Express = require('express')
const Router = Express.Router()
const { ErrorHandler } = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
// middleware autenticacion y permisos
const { esUsuarioValido, verificarPermiso, verPermisosABM } = require('../middlewares/validadorSesionYPermisos')
const db = require('../utils/db')

const name = ''
const caption = ''

Router.post('/verificarPermiso', esUsuarioValido, catchAsyncErrors(verificarPermisos))

async function verificarPermisos(req, res, next) {
  try {
    if (!req.body.proceso || !req.body.titulo) {
      return next(new ErrorHandler('Error en parametros', 404))
    }
    let permiso = await Usuario.verificarPermiso(req.usuario, req.body.proceso, req.body.titulo)    

    res.status(200).json({ validado: permiso })
  } catch (error) {
    console.log(error)
    return next(new ErrorHandler('Error interno', 500, error.message))
  }
}



module.exports = Router
