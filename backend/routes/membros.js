const express = require('express');
const { body, validationResult } = require('express-validator');
const Membro = require('../models/Membro');
const { authMiddleware, adminRequired, leadershipRequired } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/membros
// @desc    Listar todos os membros
// @access  Private
router.get('/', authMiddleware, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            cargo,
            membro,
            batizado
        } = req.query;

        const query = {};

        // Filtros
        if (search) {
            query.$or = [
                { nome: { $regex: search, $options: 'i' } },
                { sobrenome: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        if (status) query.status = status;
        if (cargo) query.cargo = cargo;
        if (membro !== undefined) query.membro = membro === 'true';
        if (batizado !== undefined) query.batizado = batizado === 'true';

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { nome: 1, sobrenome: 1 },
            populate: 'responsavelCadastro',
            select: '-documentos'
        };

        const membros = await Membro.paginate(query, options);

        res.json({
            success: true,
            data: membros.docs,
            pagination: {
                currentPage: membros.page,
                totalPages: membros.totalPages,
                totalDocs: membros.totalDocs,
                hasNextPage: membros.hasNextPage,
                hasPrevPage: membros.hasPrevPage
            }
        });

    } catch (error) {
        console.error('Erro ao listar membros:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   GET /api/membros/stats
// @desc    Estatísticas dos membros
// @access  Private
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const stats = await Promise.all([
            Membro.countDocuments({ status: 'ativo' }),
            Membro.countDocuments({ membro: true }),
            Membro.countDocuments({ batizado: true }),
            Membro.countDocuments({ cargo: { $ne: 'Membro' } })
        ]);

        const faixasEtarias = await Membro.aggregate([
            {
                $addFields: {
                    idade: {
                        $floor: {
                            $divide: [
                                { $subtract: [new Date(), '$dataNascimento'] },
                                365.25 * 24 * 60 * 60 * 1000
                            ]
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $switch: {
                            branches: [
                                { case: { $lt: ['$idade', 18] }, then: 'Até 17 anos' },
                                { case: { $lt: ['$idade', 30] }, then: '18-29 anos' },
                                { case: { $lt: ['$idade', 50] }, then: '30-49 anos' },
                                { case: { $lt: ['$idade', 65] }, then: '50-64 anos' }
                            ],
                            default: '65+ anos'
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalAtivos: stats[0],
                totalMembros: stats[1],
                totalBatizados: stats[2],
                totalLideranca: stats[3],
                faixasEtarias
            }
        });

    } catch (error) {
        console.error('Erro ao obter estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   GET /api/membros/:id
// @desc    Obter membro por ID
// @access  Private
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const membro = await Membro.findById(req.params.id)
            .populate('responsavelCadastro', 'name email')
            .populate('familiares.membroId', 'nome sobrenome');

        if (!membro) {
            return res.status(404).json({
                success: false,
                message: 'Membro não encontrado'
            });
        }

        res.json({
            success: true,
            data: membro
        });

    } catch (error) {
        console.error('Erro ao buscar membro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   POST /api/membros
// @desc    Criar novo membro
// @access  Private (Leadership)
router.post('/', [authMiddleware, leadershipRequired], [
    body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
    body('sobrenome').trim().isLength({ min: 2, max: 100 }).withMessage('Sobrenome deve ter entre 2 e 100 caracteres'),
    body('email').optional().isEmail().normalizeEmail().withMessage('E-mail inválido'),
    body('dataNascimento').isISO8601().withMessage('Data de nascimento inválida'),
    body('genero').isIn(['M', 'F', 'Outro']).withMessage('Gênero inválido'),
    body('estadoCivil').isIn(['Solteiro', 'Casado', 'Divorciado', 'Viúvo', 'União Estável']).withMessage('Estado civil inválido')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const membroData = {
            ...req.body,
            responsavelCadastro: req.user._id
        };

        const membro = new Membro(membroData);
        await membro.save();

        res.status(201).json({
            success: true,
            message: 'Membro criado com sucesso',
            data: membro
        });

    } catch (error) {
        console.error('Erro ao criar membro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   PUT /api/membros/:id
// @desc    Atualizar membro
// @access  Private (Leadership)
router.put('/:id', [authMiddleware, leadershipRequired], async (req, res) => {
    try {
        const membro = await Membro.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!membro) {
            return res.status(404).json({
                success: false,
                message: 'Membro não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Membro atualizado com sucesso',
            data: membro
        });

    } catch (error) {
        console.error('Erro ao atualizar membro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   DELETE /api/membros/:id
// @desc    Excluir membro
// @access  Private (Admin only)
router.delete('/:id', [authMiddleware, adminRequired], async (req, res) => {
    try {
        const membro = await Membro.findByIdAndDelete(req.params.id);

        if (!membro) {
            return res.status(404).json({
                success: false,
                message: 'Membro não encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Membro excluído com sucesso'
        });

    } catch (error) {
        console.error('Erro ao excluir membro:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router;