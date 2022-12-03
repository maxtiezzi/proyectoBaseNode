const Mssql = require('mssql')
const dotenv = require('dotenv')
const { ErrorHandler } = require('../utils/errorHandler')
const { ErrorRemotoHandler } = require('../utils/errorHandler')

// cargo el archivo de configuracion
if (process.env.PROYECTO === 'regional') {
    dotenv.config({ path: 'config/configregional.env' })
} else { dotenv.config({ path: 'config/config.env' }) }

// eslint-disable-next-line no-undef
let dbConfig = JSON.parse(process.env.DBCONFIG)

async function llamarSP(sp, parametros) {
    // if (!(typeof parametros === 'object' && parametros !== null)) { throw new ErrorHandler('Error parametros API', 400) }
    let ret
    let consulta
    let pool = {}
    try {
        pool = await getPool('empresa', dbConfig)
        consulta = pool.request()
        for (let [parametro, valor] of Object.entries(parametros)) {
            consulta.input(parametro, valor)
        }
        ret = await consulta.execute(sp)
    } catch (error) {
        console.error(error)
        if (error.name === 'RequestError') {
            throw new ErrorHandler('Error de SQL', 500, error.message)
        } else {
            throw new ErrorHandler('Error interno', 500, error.message)
        }
    }

    let tipo = ''
    let mensajeError = ''

    // Este fragmento de codigo medio desordenado lo que hace es revisar si el sp manda columnas 'tipo' y 'mensaje', pero ignorando las mayusculas. esto se hace porque la db puede tirar un error usando un registro con esos valores, pero no se sabe como llegan las mayusculas
    if (ret.recordsets.length > 0) {
        for (let index = 0; index < ret.recordsets[0].length; index++) {
            for (const key in Object.keys(ret.recordsets[0][0])) {
                if (Object.keys(ret.recordsets[0][0])[key].toUpperCase() === 'TIPO') {
                    tipo = ret.recordsets[0][0][Object.keys(ret.recordsets[0][0])[key]]
                    continue
                }
                if (Object.keys(ret.recordsets[0][0])[key].toUpperCase() === 'MENSAJE' || Object.keys(ret.recordsets[0][0])[key].toUpperCase() === 'COMENTARIO') {
                    mensajeError = ret.recordsets[0][0][Object.keys(ret.recordsets[0][0])[key]]
                    continue
                }
            }

            if (tipo && tipo.toUpperCase().trim() === 'ERROR') {
                console.log('error remoto')
                throw new ErrorRemotoHandler(mensajeError, 400)
            }
        }
    }

    return ret.recordsets
}












async function llamarSP2(sp) { // Ejecuta un SP sin parámetros.
    let ret
    let consulta
    let pool = {}
    try {
        pool = await getPool('empresa', dbConfig)
        consulta = pool.request()
        ret = await consulta.execute(sp)
    } catch (error) {
        console.error(error)
        if (error.name === 'RequestError') {
            throw new ErrorHandler('Error de SQL', 500, error.message)
        } else {
            throw new ErrorHandler('Error interno', 500, error.message)
        }
    }

    let tipo = ''
    let mensajeError = ''

    // Este fragmento de codigo medio desordenado lo que hace es revisar si el sp manda columnas 'tipo' y 'mensaje', pero ignorando las mayusculas. esto se hace porque la db puede tirar un error usando un registro con esos valores, pero no se sabe como llegan las mayusculas
    if (ret.recordsets.length > 0) {
        for (let index = 0; index < ret.recordsets[0].length; index++) {
            for (const key in Object.keys(ret.recordsets[0][0])) {
                if (Object.keys(ret.recordsets[0][0])[key].toUpperCase() === 'TIPO') {
                    tipo = ret.recordsets[0][0][Object.keys(ret.recordsets[0][0])[key]]
                    continue
                }
                if (Object.keys(ret.recordsets[0][0])[key].toUpperCase() === 'MENSAJE' || Object.keys(ret.recordsets[0][0])[key].toUpperCase() === 'COMENTARIO') {
                    mensajeError = ret.recordsets[0][0][Object.keys(ret.recordsets[0][0])[key]]
                    continue
                }
            }

            if (tipo.toUpperCase().trim() === 'ERROR') {
                console.log('error remoto')
                throw new ErrorRemotoHandler(mensajeError, 400)
            }
        }
    }

    return ret.recordsets
}














const pools = {}

// manage a set of pools by name (config will be required to create the pool)
// a pool will be removed when it is closed
async function getPool(name, config) {
    if (!Object.prototype.hasOwnProperty.call(pools, name)) {
        const pool = new Mssql.ConnectionPool(config)
        const close = pool.close.bind(pool)
        pool.close = (...args) => {
            delete pools[name]
            return close(...args)
        }
        await pool.connect()
        pools[name] = pool
    }
    return pools[name]
}

// // close all pools
// function closeAll () {
//   return Promise.all(Object.values(pools).map((pool) => {
//    return pool.close()
//   }))
// }

async function parametros(nombre, valorNuevo) {
    switch (typeof valorNuevo) {
        case 'number':
            return await llamarSP('UpdateparametroValorN ', { parametro: nombre, valorN: valorNuevo })

        case 'string':
            return await llamarSP('UpdateparametroValorC ', { parametro: nombre, valorC: valorNuevo })

        default:
            if (!valorNuevo) {
                return (await llamarSP('GetParametroDescrip', { parametro: nombre }))[0][0]
            }
            throw new Error('Tipo de dato no contemplado')
    }
}

exports.llamarSP = llamarSP
exports.llamarSP2 = llamarSP2
exports.parametros = parametros