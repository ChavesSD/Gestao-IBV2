const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('🔄 Tentando conectar ao MongoDB Atlas...');
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB Atlas conectado: ${conn.connection.host}`);
        console.log(`🗄️  Database: ${conn.connection.name}`);
        
        // Evento de erro
        mongoose.connection.on('error', (err) => {
            console.error('❌ Erro na conexão MongoDB:', err);
        });

        // Evento de desconexão
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB desconectado');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🛑 Conexão MongoDB fechada.');
            process.exit(0);
        });

        return conn;
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB Atlas:', error.message);
        
        if (error.message.includes('authentication failed')) {
            console.error('🔐 Erro de autenticação: Verifique usuário e senha no Atlas');
        }
        
        if (error.message.includes('network')) {
            console.error('🌐 Erro de rede: Verifique sua conexão e IP whitelist no Atlas');
        }
        
        process.exit(1);
    }
};

module.exports = connectDB;