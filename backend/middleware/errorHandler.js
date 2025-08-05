const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log do erro
    console.error('❌ Erro:', err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Recurso não encontrado';
        error = { message, statusCode: 404 };
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        let message = 'Recurso duplicado';
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        
        if (field === 'email') {
            message = `E-mail '${value}' já está cadastrado`;
        } else if (field === 'cpf') {
            message = `CPF '${value}' já está cadastrado`;
        } else {
            message = `${field} '${value}' já existe`;
        }
        
        error = { message, statusCode: 400 };
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = { message, statusCode: 400 };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Token inválido';
        error = { message, statusCode: 401 };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expirado';
        error = { message, statusCode: 401 };
    }

    // Multer errors (upload de arquivos)
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'Arquivo muito grande';
        error = { message, statusCode: 400 };
    }

    if (err.code === 'LIMIT_FILE_COUNT') {
        const message = 'Muitos arquivos enviados';
        error = { message, statusCode: 400 };
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        const message = 'Tipo de arquivo não permitido';
        error = { message, statusCode: 400 };
    }

    // Rate limit error
    if (err.status === 429) {
        const message = 'Muitas tentativas. Tente novamente mais tarde.';
        error = { message, statusCode: 429 };
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;