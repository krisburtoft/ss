const log4js = require( 'log4js' );
const args = require( 'minimist' )( process.argv.slice( 2 ), {
    'default': {
        'll': 'info'
    }
} );


module.exports = function getLogger( name ) {
    const logger = log4js.getLogger( name );

    logger.level = args.ll;
    return logger;
};
