const Usuario = require('../models/usuario')
const Express = require('express')
const Router = Express.Router()
const { ErrorHandler } = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
// middleware autenticacion y permisos
const { firmarYEncriptarCookie } = require('../middlewares/validadorSesionYPermisos')

const name = 'abmusuarios'
const caption = 'ABM de Usuarios'

Router.get('/logout', catchAsyncErrors(logout))
Router.get('/:id', catchAsyncErrors(getId))
Router.post('/login', catchAsyncErrors(login))


async function getId(req, res, next) {
  try {
    let ret = await Usuario.get(req.params.id)
    if (!ret.idUsuario) {
      return next(new ErrorHandler('Usuario no encontrado', 404))
    }
    res.status(200).json(ret)
  } catch (error) {
    if (error.name === 'ErrorRemotoHandler') {
      return next(error)
    }
    console.error(error)
    return next(new ErrorHandler('Error interno', 500, error.message))
  }
}

async function login(req, res, next) {
  try {
    let ret = await Usuario.login(req.body.usuario, req.body.contraseña)
    if (!ret.idUsuario) {
      return next(new ErrorHandler('Usuario o contraseña incorrecta', 401))
    }
    firmarYEncriptarCookie(res, 'idCliente', '', req.headers.origin)
    firmarYEncriptarCookie(res, 'idUsuario', ret.idUsuario, req.headers.origin)
    res.status(200).json(ret)
  } catch (error) {
    if (error.name === 'ErrorRemotoHandler') {
      return next(error)
    }
    console.error(error)
    return next(new ErrorHandler('Error interno', 500, error.message))
  }
}

async function logout(req, res, next) {
  try {
    for (const key in req.cookies) {
      if (key !== 'Path' && Object.prototype.hasOwnProperty.call(req.cookies, key)) {
        firmarYEncriptarCookie(res, key, '', req.headers.origin)
      }
    }
    res.status(200).json()
  } catch (error) {
    if (error.name === 'ErrorRemotoHandler') {
      return next(error)
    }
    console.error(error)
    return next(new ErrorHandler('Error interno', 500, error.message))
  }
}

module.exports = Router
