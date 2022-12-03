const Bcd = require('../models/bcd')
const Express = require('express')
const Router = Express.Router()
const { ErrorHandler } = require('./errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
// middleware autenticacion y permisos
const db = require('./db')
const TrackingFedex = require('../models/trackingFedex')

Router.get('/', catchAsyncErrors(pruebafedex))
Router.get('/xpermisos', catchAsyncErrors(xpermisos))

async function tirarError (req, res, next) {
  try {
    await db.llamarSP('tiraError', {})
    res.status(200).json({})
  } catch (error) {
    if (error.name === 'ErrorRemotoHandler') {
      return next(error)
    }
    console.error(error)
    return next(new ErrorHandler('Error interno', 500, error.message))
  }
}

async function xpermisos (req, res, next) {
  try {
    await db.llamarSP('xpermisos', { login: 'BarraGyeSis' })
    res.status(200).json({})
  } catch (error) {
    if (error.name === 'ErrorRemotoHandler') {
      return next(error)
    }
    console.error(error)
    return next(new ErrorHandler('Error interno', 500, error.message))
  }
}

async function pruebafedex (req, res, next) {
  let t = new TrackingFedex('oIFtSK9A0yppOdin', 'UYBCDT94nVnjSkl0SJRF0nBWN', 801458068, 114008600)
  res.status(200).json(await t.solicitar())
}

module.exports = Router
