const mongoose = require('mongoose');

const configuracaoSchema = new mongoose.Schema({
    nomeIgreja: {
        type: String,
        required: [true, 'Nome da igreja é obrigatório'],
        trim: true,
        maxlength: [200, 'Nome da igreja deve ter no máximo 200 caracteres']
    },
    endereco: {
        rua: { type: String, trim: true },
        numero: { type: String, trim: true },
        complemento: { type: String, trim: true },
        bairro: { type: String, trim: true },
        cidade: { type: String, trim: true },
        estado: { type: String, trim: true },
        cep: { type: String, trim: true }
    },
    telefone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'E-mail inválido']
    },
    website: {
        type: String,
        trim: true
    },
    cnpj: {
        type: String,
        trim: true,
        unique: true,
        sparse: true
    },
    pastor: {
        nome: { type: String, trim: true },
        telefone: { type: String, trim: true },
        email: { type: String, trim: true }
    },
    configuracoes: {
        backup: {
            automatico: { type: Boolean, default: false },
            frequencia: { type: String, enum: ['diario', 'semanal', 'mensal'], default: 'semanal' },
            ultimoBackup: { type: Date }
        },
        notificacoes: {
            email: { type: Boolean, default: true },
            eventos: { type: Boolean, default: true },
            aniversarios: { type: Boolean, default: true }
        },
        sistema: {
            manutencao: { type: Boolean, default: false },
            mensagemManutencao: { type: String, trim: true },
            versao: { type: String, default: '1.0.0' }
        }
    },
    ultimaAtualizacao: {
        type: Date,
        default: Date.now
    },
    atualizadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Método para obter configuração única
configuracaoSchema.statics.getConfig = async function() {
    let config = await this.findOne();
    
    if (!config) {
        // Criar configuração padrão se não existir
        config = await this.create({
            nomeIgreja: 'Igreja Batista Vida 2',
            endereco: {},
            configuracoes: {
                backup: {
                    automatico: false,
                    frequencia: 'semanal'
                },
                notificacoes: {
                    email: true,
                    eventos: true,
                    aniversarios: true
                },
                sistema: {
                    manutencao: false,
                    versao: '1.0.0'
                }
            }
        });
    }
    
    return config;
};

// Método para atualizar configuração
configuracaoSchema.statics.updateConfig = async function(updateData, userId) {
    const config = await this.getConfig();
    
    Object.assign(config, updateData);
    config.ultimaAtualizacao = new Date();
    config.atualizadoPor = userId;
    
    return config.save();
};

module.exports = mongoose.model('Configuracao', configuracaoSchema);