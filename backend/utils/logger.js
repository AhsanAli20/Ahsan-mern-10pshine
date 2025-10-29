const pino = require('pino');

// Pino ko configure karein
const logger = pino({
    // Logging level set karein (Production mein 'info', development mein 'debug')
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    
    // Time format ko zyaada readable banane ke liye
    timestamp: () => `,"time":"${new Date().toISOString()}"`, 
    
    // Log level ko UPPERCASE mein dikhana
    formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
    },

    base: {
        app: 'Notes-App-Backend',
    },
    
    transport: process.env.NODE_ENV !== 'production' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
        },
    } : undefined,
});

module.exports = logger;