const Db = require('../utils/db');
const { ErrorHandler } = require('../utils/errorHandler');
class Usuario {
    constructor(idUsuario, idSucursal, usuNombre, usuNivel, usuVigente, usuUltLogin, usuServerPort, usuSendUsing, usuSmtpAuthenticate, usuSmtpUseSsl, usuSendUsername, usuNombreApellido, usuEnviarABandeja, usuSmtpsSrver, usuMaxMailsPorGrupo, usuMailDelayEntreGrupos, esInterno) {
        this.idUsuario = idUsuario
        this.idSucursal = idSucursal
        this.usuNombre = usuNombre
        this.usuNivel = usuNivel
        this.usuVigente = usuVigente
        this.usuUltLogin = usuUltLogin
        this.usuServerPort = usuServerPort
        this.usuSendUsing = usuSendUsing
        this.usuSmtpAuthenticate = usuSmtpAuthenticate
        this.usuSmtpUseSsl = usuSmtpUseSsl
        this.usuSendUsername = usuSendUsername
        this.usuNombreApellido = usuNombreApellido
        this.usuEnviarABandeja = usuEnviarABandeja
        this.usuSmtpsSrver = usuSmtpsSrver
        this.usuMaxMailsPorGrupo = usuMaxMailsPorGrupo
        this.usuMailDelayEntreGrupos = usuMailDelayEntreGrupos
        this.esInterno = esInterno
    }

    static async get(id) {
        try {
            var rta = await Db.llamarSP('GetUsuario', { IdUsuario: id })
            var ret = new Usuario()
            if (rta && rta[0] && rta[0][0]) {
                ret.idUsuario = rta[0][0].IDUSUARIO
                ret.idSucursal = rta[0][0].idsucursal
                ret.usuNombre = rta[0][0].USUNOMBRE
                ret.usuNivel = rta[0][0].USUNIVEL
                ret.usuVigente = rta[0][0].USUVIGENTE
                ret.usuUltLogin = rta[0][0].USUULTLOGIN
                ret.usuServerPort = rta[0][0].USUSERVERPORT
                ret.usuSendUsing = rta[0][0].USUSENDUSING
                ret.usuSmtpAuthenticate = rta[0][0].USUSMTPAUTHENTICATE
                ret.usuSmtpUseSsl = rta[0][0].USUSMTPUSESSL
                ret.usuSendUsername = rta[0][0].USUSENDUSERNAME
                ret.usuNombreApellido = rta[0][0].USUNOMBREAPELLIDO
                ret.usuEnviarABandeja = rta[0][0].USUENVIARABANDEJA
                ret.usuSmtpServer = rta[0][0].USUSMTPSERVER
                ret.usuMaxMailsPorGrupo = rta[0][0].usuMaxMailsPorGrupo
                ret.usuMailDelayEntreGrupos = rta[0][0].usuMailDelayEntreGrupos
                ret.esInterno = rta[0][0].esInterno
            }
            return ret;
        } catch (error) {
            throw error
        }
    }

    static async insert(obj) {
        if (!(obj instanceof Usuario)) { throw new ErrorHandler('Error parametros API', 400); }
        var rta = await Db.llamarSP();
    }

    static async update(obj) {
        if (!(obj instanceof Usuario)) { throw new ErrorHandler('Error parametros API', 400); }
        var rta = await Db.llamarSP();
    }

    static async delete(obj) {
        if (!(obj instanceof Usuario)) { throw new ErrorHandler('Error parametros API', 400); }
        var rta = await Db.llamarSP();
    }

    static async login(usuario, contraseña) {
        if (!usuario || !contraseña) {
            throw new ErrorHandler('Error parametros API', 400);
        }

        var rta = await Db.llamarSP('getlogin_api', { xusuario: usuario, xclave: contraseña })
        var ret
        if (rta && rta[0] && rta[0][0] && rta[0][0].IDUSUARIO) {
            ret = this.get(rta[0][0].IDUSUARIO)
        }
        return ret;
    }

    static async verificarPermiso(usuario, proceso, titulo) {
        try {
            if (!usuario || !usuario.idUsuario || !proceso || !titulo)
                throw new ErrorHandler('Error interno', 500, 'No se obtuvieron los parametros necesarios para verificar permisos')

            var rta = await Db.llamarSP('ACCEDER', { USUARIO: usuario.idUsuario, PROCESO: proceso, TITULO: titulo })
            var ret
            if (rta && rta[0] && rta[0][0] && rta[0][0].resultseguridad) {
                if (rta[0][0].resultseguridad === 1)
                    return true;
                else
                    return false;
            }
        } catch (error) {
            throw new ErrorHandler('Error interno', 500, error.message)
        }
    }

    static async verPermisosABM(usuario, proceso, titulo) {
        try {
            if (!usuario || !usuario.idUsuario || !proceso || !titulo)
                throw new ErrorHandler('Error interno', 500, 'No se obtuvieron los parametros necesarios para verificar permisos')
            var rta = await Db.llamarSP('ACCEDERABM', { IDUSUARIO: usuario.idUsuario, PROCDESCRIP: proceso, PROCTITULO: titulo, N: true, M: true, E: true, V: true })
            var ret = {}
            if (rta && rta[0] && rta[0][0]) {
                ret.Insertar = rta[0][0].Insertar;
                ret.Modificar = rta[0][0].Modificar;
                ret.Eliminar = rta[0][0].Eliminar;
                ret.Visualizar = rta[0][0].Visualizar;
                return ret
            }

        } catch (error) {
            throw new ErrorHandler('Error interno', 500, error.message)
        }
    }

}


module.exports = Usuario