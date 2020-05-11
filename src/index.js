import logger from './logger';

const {
    API,
} = require('./api');

const api = new API();

api.ws.on('open', () => {
    logger.info('Open connection');

    api.authenticate();
});

api.ws.on('close', () => {
    logger.info('close connection');
});

api.ws.on('error', (err) => {
    logger.error(err);
});
