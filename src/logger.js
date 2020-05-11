import chalk from 'chalk';

import {
    format,
    transports,
    createLogger,
} from 'winston';

const parseLevel = (info) => {
    const level = info.level.toUpperCase();

    switch (level) {
    case 'INFO':
        return chalk.blueBright(level);

    case 'ERROR':
        return chalk.redBright(level);

    default:
        return level;
    }
};

const handleTemplate = (info) => {
    const level = parseLevel(info);
    return `${info.timestamp} [${level}]: ${info.message}`;
};

const logger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        format.printf(handleTemplate),
    ),
    transports: [
        new transports.File({
            filename: '../var/logs/all-logs.log',
            json: false,
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new transports.Console(),
    ],
});

export default logger;
