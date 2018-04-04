const moment = require('moment-timezone');
const config = require('./config.json');
const bunyan = require('bunyan');
const bformat = require('bunyan-format');

let log = bunyan.createLogger({
    name: config.name,
    time: moment().tz(config.logging.logTimeZone).format(config.logging.TimeFormat),
    streams: [
        {
            level: 'fatal',
            path: './data/logs/fatal-logs'
        },
        {
            level: 'error',
            path: './data/logs/error-logs',
            type: 'rotating-file',
            period: '1d',
            count: 2
        },
        {
            level: 'info',
            path: './data/logs/info-logs',
            type: 'rotating-file',
            period: '1d',
            count: 2
        },
        {
            level: 'debug',
            path: './data/logs/debug-logs'
        },
        {
            level: 'trace',
            stream: bformat({
                outputMode: 'short',
                colorFromLevel: {
                    '10': 'blue', //trace
                    '20': 'blue', //debug
                    '30': 'green', //info
                    '40': 'magenta', //warn
                    '50': 'red', //error
                    '60': 'brightRed' //fatal
                }
            })
        }
    ]
});

module.exports = log;