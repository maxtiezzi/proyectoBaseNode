const jwt = require('jsonwebtoken')
const { ErrorHandler } = require('../utils/errorHandler')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors')
const crypto = require('crypto')
const algorithm = 'aes-256-cbc'
const inputEncoding = 'utf8'
const outputEncoding = 'hex'
const ivlength = 16 // AES blocksize
const key = crypto.createHash('sha256').update(String(process.env.JWT_SECRET)).digest('base64').substr(0, 32)

function firmarYEncriptarCookie(reponse, cookie, value, origin) {
    try {
        let token = jwt.sign({ Dato: value.toString() }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_TIME })
        let iv = crypto.randomBytes(ivlength)
        let cipher = crypto.createCipheriv(algorithm, key, iv)
        let ciphered = cipher.update(token, inputEncoding, outputEncoding)
        ciphered += cipher.final(outputEncoding)
        let ciphertext = iv.toString(outputEncoding) + '-' + ciphered
        let tokenEncriptado = ciphertext
        reponse.cookie(cookie, tokenEncriptado, { httpOnly: true, secure: process.env.JWT_SECURE === 'true' })
        //, domain: '.' + origin.replace('www.', '').replace('https://', '').replace('http://', '').replace(/:.*/g, '')
        return true
    } catch (error) {
        throw new ErrorHandler('No se pudo firmar la cookie', 500, error.message)
    }
}

function desencriptarYVerificarCookie(request, cookie) {
    try {
        let cookieEncriptada = request.cookies[cookie]
        let components = cookieEncriptada.split('-')
        let ivFromCiphertext = Buffer.from(components.shift().replace(cookie + '=', ''), outputEncoding)
        let decipher = crypto.createDecipheriv(algorithm, key, ivFromCiphertext)
        let deciphered = decipher.update(components[0], outputEncoding, inputEncoding)
        deciphered += decipher.final(inputEncoding)
        return jwt.verify(deciphered.split(';')[0], process.env.JWT_SECRET)
    } catch (error) {
        return false
    }
}

exports.firmarYEncriptarCookie = firmarYEncriptarCookie