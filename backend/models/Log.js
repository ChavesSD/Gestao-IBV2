const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['login', 'logout', 'create', 'update', 'delete', 'view'],
        required: [true, 'Tipo do log é obrigatório']
    },
    action: {
        type: String,
        required: [true, 'Ação é obrigatória'],
        maxlength: [200, 'Ação deve ter no máximo 200 caracteres']
    },
    description: {
        type: String,
        required: [true, 'Descrição é obrigatória'],
        maxlength: [500, 'Descrição deve ter no máximo 500 caracteres']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Usuário é obrigatório']
    },
    ipAddress: {
        type: String,
        trim: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    resourceType: {
        type: String,
        enum: ['user', 'membro', 'evento', 'financeiro', 'patrimonio', 'configuracao'],
        trim: true
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        sparse: true
    },
    oldData: {
        type: mongoose.Schema.Types.Mixed
    },
    newData: {
        type: mongoose.Schema.Types.Mixed
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Índices
logSchema.index({ type: 1 });
logSchema.index({ user: 1 });
logSchema.index({ createdAt: -1 });
logSchema.index({ resourceType: 1, resourceId: 1 });

// Método estático para criar log
logSchema.statics.createLog = async function(logData, req = null) {
    const logEntry = {
        ...logData,
        ipAddress: req?.ip || req?.connection?.remoteAddress,
        userAgent: req?.get('User-Agent')
    };
    
    return this.create(logEntry);
};

// Método para filtrar logs
logSchema.statics.getFilteredLogs = async function(filters = {}) {
    const query = {};
    
    if (filters.type) {
        query.type = filters.type;
    }
    
    if (filters.user) {
        query.user = filters.user;
    }
    
    if (filters.resourceType) {
        query.resourceType = filters.resourceType;
    }
    
    if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) {
            query.createdAt.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
            query.createdAt.$lte = new Date(filters.endDate);
        }
    }
    
    return this.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100);
};

module.exports = mongoose.model('Log', logSchema);