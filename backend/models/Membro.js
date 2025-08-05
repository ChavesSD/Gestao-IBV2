const mongoose = require('mongoose');

const membroSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: [true, 'Nome é obrigatório'],
        trim: true,
        maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
    },
    sobrenome: {
        type: String,
        required: [true, 'Sobrenome é obrigatório'],
        trim: true,
        maxlength: [100, 'Sobrenome deve ter no máximo 100 caracteres']
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'E-mail inválido']
    },
    telefone: {
        type: String,
        trim: true
    },
    celular: {
        type: String,
        trim: true
    },
    whatsapp: {
        type: String,
        trim: true
    },
    dataNascimento: {
        type: Date,
        required: [true, 'Data de nascimento é obrigatória']
    },
    genero: {
        type: String,
        enum: ['M', 'F', 'Outro'],
        required: [true, 'Gênero é obrigatório']
    },
    estadoCivil: {
        type: String,
        enum: ['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável'],
        required: [true, 'Estado civil é obrigatório']
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
    cpf: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        match: [/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido']
    },
    rg: {
        type: String,
        trim: true
    },
    profissao: {
        type: String,
        trim: true
    },
    escolaridade: {
        type: String,
        enum: ['Fundamental', 'Médio', 'Superior', 'Pós-graduação', 'Mestrado', 'Doutorado']
    },
    batizado: {
        type: Boolean,
        default: false
    },
    dataBatismo: {
        type: Date
    },
    localBatismo: {
        type: String,
        trim: true
    },
    membro: {
        type: Boolean,
        default: false
    },
    dataMembresia: {
        type: Date
    },
    status: {
        type: String,
        enum: ['ativo', 'inativo', 'transferido', 'disciplinado', 'falecido'],
        default: 'ativo'
    },
    cargo: {
        type: String,
        enum: ['Pastor', 'Presbítero', 'Diácono', 'Líder', 'Professor', 'Músico', 'Membro'],
        default: 'Membro'
    },
    ministerios: [{
        nome: String,
        funcao: String,
        dataInicio: Date,
        dataFim: Date,
        ativo: { type: Boolean, default: true }
    }],
    familiares: [{
        nome: String,
        parentesco: String,
        membro: { type: Boolean, default: false },
        membroId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membro' }
    }],
    observacoes: {
        type: String,
        maxlength: [1000, 'Observações devem ter no máximo 1000 caracteres']
    },
    foto: {
        type: String,
        default: null
    },
    documentos: [{
        nome: String,
        tipo: String,
        arquivo: String,
        dataUpload: { type: Date, default: Date.now }
    }],
    responsavelCadastro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Middleware para calcular idade
membroSchema.virtual('idade').get(function() {
    if (!this.dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(this.dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    return idade;
});

// Middleware para nome completo
membroSchema.virtual('nomeCompleto').get(function() {
    return `${this.nome} ${this.sobrenome}`;
});

// Índices
membroSchema.index({ nome: 1, sobrenome: 1 });
membroSchema.index({ email: 1 });
membroSchema.index({ cpf: 1 });
membroSchema.index({ status: 1 });
membroSchema.index({ cargo: 1 });
membroSchema.index({ membro: 1 });
membroSchema.index({ batizado: 1 });

// Configurar virtuals no JSON
membroSchema.set('toJSON', { virtuals: true });
membroSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Membro', membroSchema);