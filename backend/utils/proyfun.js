const request = require('request')
const db = require('./db')
const axios = require('axios')

function clonar(obj1, obj2) {
	for (const key in obj2) {
		if (Object.prototype.hasOwnProperty.call(obj2, key)) {
			obj1[key] = obj2[key]
		}
	}
	return obj1
}
function cantidadPropiedadesConValor(obj) {
	return Object.keys(obj).filter(k => obj[k] !== null && obj[k] !== undefined).length
}


async function EnviarNotificaciones(idMensaje) {
	const ret = []
  
	const datosMensaje = await db.llamarSP('appDatosEnviarNotificaciones', { idMensaje: idMensaje })
	if(datosMensaje[0].length == 0){
		return ret
	}
	const grupos = []
	while (datosMensaje[0].length > 200) {
	  grupos.push(datosMensaje[0].splice(0, 199))
	}
	grupos.push(datosMensaje[0])
  
	const headers = {
	  'Content-Type': 'application/json',
	  Authorization: 'key = ' + (await db.parametros('tokengoogle')).ValorC
	}
  
	const data = {
	  notification: {
		title: datosMensaje[1][0].tituloMensaje,
		body: datosMensaje[1][0].resumenNotificacion,
		message: datosMensaje[1][0].textoMensaje,
		icon: 'default',
		priority: 'high',
		badge: '0'
	  },
	  priority: 'high',
	  data: {
		nombre: 'evo'
	  }
	}
  
	for (const grupo of grupos) {
	  const send = []
	  await Promise.all(grupo.map((x) => send.push(x.identificador)))
  
	  data.registration_ids = send
	  ret.push(axios.post('https://fcm.googleapis.com/fcm/send', data, {
		headers: headers
	  })
		.then()
		.catch())
	}
	return ret
  }

exports.clonar = clonar
exports.cantidadPropiedadesConValor = cantidadPropiedadesConValor
exports.EnviarNotificaciones = EnviarNotificaciones