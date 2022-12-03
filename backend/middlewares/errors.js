module.exports = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;

	if (process.env.NODE_ENV === 'development') {
		res.status(err.statusCode).json({
			mensaje: err.message,
			stack: err.stack,
			error: err
		})
	}
	else if (process.env.NODE_ENV === 'production') {
		err.message = err.message || 'Internal server error';

		res.status(err.statusCode).json({
			mensaje: err.message
		})
	}
	else {
		err.message = 'Entorno no valido'
		err.statusCode = 500
		res.status(err.statusCode).json({
			sucsess: false,
			mensaje: err.message
		})
	}


}