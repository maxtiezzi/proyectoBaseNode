class ErrorHandler extends Error {
	constructor(message, statusCode, developmentMessage) {
		if (process.env.NODE_ENV === 'development' || true)
			super(developmentMessage ? developmentMessage : message);
		else if (process.env.NODE_ENV === 'production')
			super(message)
		this.statusCode = statusCode
		this.visible = false
		Error.captureStackTrace(this, this.constructor);
	}
}

class ErrorRemotoHandler extends Error {
	constructor(message, statusCode) {
		super(message)
		this.statusCode = statusCode
		this.name = 'ErrorRemotoHandler';
		this.visible = true
		Error.captureStackTrace(this, this.constructor);
	}
}

exports.ErrorHandler = ErrorHandler
exports.ErrorRemotoHandler = ErrorRemotoHandler