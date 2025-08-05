const express = require('express');
const { query, validationResult } = require('express-validator');
const Log = require('../models/Log');
const { authMiddleware, leadershipRequired } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/logs
// @desc    Listar logs do sistema
// @access  Private (Leadership)
router.get('/', [authMiddleware, leadershipRequired], [
    query('type').optional().isIn(['login', 'logout', 'create', 'update', 'delete', 'view']).withMessage('Tipo inválido'),
    query('startDate').optional().isISO8601().withMessage('Data inicial inválida'),
    query('endDate').optional().isISO8601().withMessage('Data final inválida'),
    query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limite deve ser entre 1 e 500')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            type,
            startDate,
            endDate,
            limit = 100,
            page = 1
        } = req.query;

        const filters = {
            type,
            startDate,
            endDate,
            limit: parseInt(limit)
        };

        const logs = await Log.getFilteredLogs(filters);

        res.json({
            success: true,
            data: {
                logs,
                pagination: {
                    currentPage: parseInt(page),
                    totalLogs: logs.length
                }
            }
        });
    } catch (error) {
        console.error('Erro ao listar logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   POST /api/logs
// @desc    Criar novo log
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const logData = {
            ...req.body,
            user: req.user._id
        };

        const log = await Log.createLog(logData, req);

        res.status(201).json({
            success: true,
            message: 'Log criado com sucesso',
            data: log
        });
    } catch (error) {
        console.error('Erro ao criar log:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// @route   GET /api/logs/stats
// @desc    Estatísticas dos logs
// @access  Private (Leadership)
router.get('/stats', [authMiddleware, leadershipRequired], async (req, res) => {
    try {
        const stats = await Promise.all([
            Log.countDocuments({ type: 'login' }),
            Log.countDocuments({ type: 'create' }),
            Log.countDocuments({ type: 'update' }),
            Log.countDocuments({ type: 'delete' }),
            Log.countDocuments({
                createdAt: {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            })
        ]);

        const logsByType = await Log.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        const logsByUser = await Log.aggregate([
            {
                $group: {
                    _id: '$user',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    userName: '$user.name',
                    count: 1
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalLogins: stats[0],
                totalCreated: stats[1],
                totalUpdated: stats[2],
                totalDeleted: stats[3],
                last7Days: stats[4],
                byType: logsByType,
                byUser: logsByUser
            }
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas dos logs:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

module.exports = router;