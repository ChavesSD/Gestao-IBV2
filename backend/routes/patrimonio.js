const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Rota temporária básica
router.get('/', authMiddleware, (req, res) => {
    res.json({
        success: true,
        message: 'Módulo patrimônio em desenvolvimento',
        data: []
    });
});

module.exports = router;