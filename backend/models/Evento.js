const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'Título é obrigatório'],
        trim: true,
        maxlength: [200, 'Título deve ter no máximo 200 caracteres']
    },
    descricao: {
        type: String,
        trim: true,
        maxlength: [2000, 'Descrição deve ter no máximo 2000 caracteres']
    },
    tipo: {
        type: String,
        enum: ['Culto', 'Reunião', 'Conferência', 'Seminário', 'Retiro', 'Casamento', 'Batismo', 'Funeral', 'Celebração', 'Outro'],
        required: [true, 'Tipo é obrigatório']
    },
    categoria: {
        type: String,
        enum: ['Espiritual', 'Social', 'Educacional', 'Evangelístico', 'Administrativo'],
        required: [true, 'Categoria é obrigatória']
    },
    dataInicio: {
        type: Date,
        required: [true, 'Data de início é obrigatória']
    },
    dataFim: {
        type: Date,
        required: [true, 'Data de fim é obrigatória']
    },
    horaInicio: {
        type: String,
        required: [true, 'Hora de início é obrigatória'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    },
    horaFim: {
        type: String,
        required: [true, 'Hora de fim é obrigatória'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    },
    local: {
        nome: {
            type: String,
            required: [true, 'Nome do local é obrigatório'],
            trim: true
        },
        endereco: {
            rua: String,
            numero: String,
            bairro: String,
            cidade: String,
            estado: String,
            cep: String
        },
        capacidade: {
            type: Number,
            min: [1, 'Capacidade deve ser pelo menos 1']
        }
    },
    organizador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Organizador é obrigatório']
    },
    responsaveis: [{
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        funcao: {
            type: String,
            trim: true
        }
    }],
    participantes: [{
        membro: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Membro'
        },
        dataInscricao: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['confirmado', 'pendente', 'cancelado'],
            default: 'pendente'
        },
        observacoes: String
    }],
    limitePessoas: {
        type: Number,
        min: [1, 'Limite de pessoas deve ser pelo menos 1']
    },
    inscricaoObrigatoria: {
        type: Boolean,
        default: false
    },
    dataLimiteInscricao: {
        type: Date
    },
    status: {
        type: String,
        enum: ['agendado', 'em_andamento', 'finalizado', 'cancelado', 'adiado'],
        default: 'agendado'
    },
    publico: {
        type: String,
        enum: ['publico', 'membros', 'lideranca', 'convidados'],
        default: 'publico'
    },
    custos: {
        valor: {
            type: Number,
            min: [0, 'Valor não pode ser negativo'],
            default: 0
        },
        descricao: String,
        obrigatorio: {
            type: Boolean,
            default: false
        }
    },
    recursos: [{
        nome: String,
        tipo: String,
        quantidade: Number,
        responsavel: String
    }],
    anexos: [{
        nome: String,
        arquivo: String,
        tipo: String,
        tamanho: Number,
        dataUpload: {
            type: Date,
            default: Date.now
        }
    }],
    observacoes: {
        type: String,
        maxlength: [1000, 'Observações devem ter no máximo 1000 caracteres']
    },
    tags: [String],
    recorrente: {
        ativo: {
            type: Boolean,
            default: false
        },
        frequencia: {
            type: String,
            enum: ['diaria', 'semanal', 'mensal', 'anual']
        },
        diasSemana: [Number], // 0-6 (Domingo-Sábado)
        dataFimRecorrencia: Date
    }
}, {
    timestamps: true
});

// Middleware para validar datas
eventoSchema.pre('save', function(next) {
    if (this.dataFim < this.dataInicio) {
        return next(new Error('Data de fim deve ser posterior à data de início'));
    }
    
    if (this.dataLimiteInscricao && this.dataLimiteInscricao > this.dataInicio) {
        return next(new Error('Data limite de inscrição deve ser anterior ao início do evento'));
    }
    
    next();
});

// Virtual para quantidade de participantes confirmados
eventoSchema.virtual('participantesConfirmados').get(function() {
    return this.participantes.filter(p => p.status === 'confirmado').length;
});

// Virtual para verificar se evento está lotado
eventoSchema.virtual('lotado').get(function() {
    if (!this.limitePessoas) return false;
    return this.participantesConfirmados >= this.limitePessoas;
});

// Virtual para duração do evento
eventoSchema.virtual('duracao').get(function() {
    const inicio = new Date(`1970-01-01T${this.horaInicio}:00`);
    const fim = new Date(`1970-01-01T${this.horaFim}:00`);
    return Math.abs(fim - inicio) / (1000 * 60 * 60); // em horas
});

// Índices
eventoSchema.index({ dataInicio: 1 });
eventoSchema.index({ tipo: 1 });
eventoSchema.index({ categoria: 1 });
eventoSchema.index({ status: 1 });
eventoSchema.index({ organizador: 1 });
eventoSchema.index({ 'local.nome': 1 });
eventoSchema.index({ tags: 1 });

// Configurar virtuals no JSON
eventoSchema.set('toJSON', { virtuals: true });
eventoSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Evento', eventoSchema);