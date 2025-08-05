const express = require('express');
const { body, validationResult } = require('express-validator');
const Evento = require('../models/Evento');
const { authMiddleware, leadershipRequired } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/eventos
// @desc    Listar eventos
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            tipo,
            categoria,
            status,
            dataInicio,
            dataFim
        } = req.query;

        const query = {};

        // Filtros
        if (tipo) query.tipo = tipo;
        if (categoria) query.categoria = categoria;
        if (status) query.status = status;

        // Filtro por data
        if (dataInicio || dataFim) {
            query.dataInicio = {};
            if (dataInicio) query.dataInicio.$gte = new Date(dataInicio);
            if (dataFim) query.dataInicio.$lte = new Date(dataFim);
        }

        const eventos = await Evento.find(query)
            .populate('organizador', 'name email')
            .populate('responsaveis.usuario', 'name email')
            .sort({ dataInicio: 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Evento.countDocuments(query);

        res.json({
            success: true,
            data: eventos,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalDocs: total,
                hasNextPage: page * limit < total,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Erro ao listar eventos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   GET /api/eventos/calendario
// @desc    Eventos para calendário
// @access  Private
router.get('/calendario', authMiddleware, async (req, res) => {
    try {
        const { mes, ano } = req.query;
        
        const startDate = new Date(ano, mes - 1, 1);
        const endDate = new Date(ano, mes, 0);

        const eventos = await Evento.find({
            dataInicio: {
                $gte: startDate,
                $lte: endDate
            },
            status: { $ne: 'cancelado' }
        })
        .select('titulo tipo dataInicio dataFim horaInicio horaFim local.nome status')
        .sort({ dataInicio: 1 });

        res.json({
            success: true,
            data: eventos
        });

    } catch (error) {
        console.error('Erro ao buscar eventos do calendário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   GET /api/eventos/:id
// @desc    Obter evento por ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id)
            .populate('organizador', 'name email')
            .populate('responsaveis.usuario', 'name email')
            .populate('participantes.membro', 'nome sobrenome email');

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento não encontrado'
            });
        }

        res.json({
            success: true,
            data: evento
        });

    } catch (error) {
        console.error('Erro ao buscar evento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   POST /api/eventos
// @desc    Criar novo evento
// @access  Private (Leadership)
router.post('/', [authMiddleware, leadershipRequired], [
    body('titulo').trim().isLength({ min: 3, max: 200 }).withMessage('Título deve ter entre 3 e 200 caracteres'),
    body('tipo').isIn(['Culto', 'Reunião', 'Conferência', 'Seminário', 'Retiro', 'Casamento', 'Batismo', 'Funeral', 'Celebração', 'Outro']).withMessage('Tipo inválido'),
    body('categoria').isIn(['Espiritual', 'Social', 'Educacional', 'Evangelístico', 'Administrativo']).withMessage('Categoria inválida'),
    body('dataInicio').isISO8601().withMessage('Data de início inválida'),
    body('dataFim').isISO8601().withMessage('Data de fim inválida'),
    body('horaInicio').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato de hora de início inválido'),
    body('horaFim').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato de hora de fim inválido'),
    body('local.nome').trim().isLength({ min: 2 }).withMessage('Nome do local é obrigatório')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const eventoData = {
            ...req.body,
            organizador: req.user._id
        };

        const evento = new Evento(eventoData);
        await evento.save();

        res.status(201).json({
            success: true,
            message: 'Evento criado com sucesso',
            data: evento
        });

    } catch (error) {
        console.error('Erro ao criar evento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   PUT /api/eventos/:id
// @desc    Atualizar evento
// @access  Private (Leadership)
router.put('/:id', [authMiddleware, leadershipRequired], async (req, res) => {
    try {
        const evento = await Evento.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Evento atualizado com sucesso',
            data: evento
        });

    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   DELETE /api/eventos/:id
// @desc    Excluir evento
// @access  Private (Leadership)
router.delete('/:id', [authMiddleware, leadershipRequired], async (req, res) => {
    try {
        const evento = await Evento.findByIdAndDelete(req.params.id);

        if (!evento) {
            return res.status(404).json({
                success: false,
                message: 'Evento não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Evento excluído com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router;