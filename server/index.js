const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.config.js');
const subscribeToMarkets = require('./order-books');
const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const logger = require('./util/logger')('server');
const dirName = path.dirname(require.main.filename);
const actions = require('../shared/actions.json');

if (isDeveloping) {
    const compiler = webpack(config);
    const middleware = webpackMiddleware(compiler, {
        publicPath: config.output.publicPath,
        contentBase: 'src',
        stats: {
            colors: true,
            hash: false,
            timings: true,
            chunks: false,
            chunkModules: false,
            modules: false
        }
    });

    app.use(middleware);
    app.use(webpackHotMiddleware(compiler));

    app.get('*', function response(req, res) {
        res.write(middleware.fileSystem.readFileSync(path.join(dirName, 'dist/index.html')));
        res.end();
    });
} else {
    app.use(express.static(dirName + '/dist'));
    app.get('*', function response(req, res) {
        res.sendFile(path.join(dirName, 'dist/index.html'));
    });
}

app.use((err, req, res, next) => {
    const { path, ...publicError } = err;
    logger.error(err);
    res.status(500).send(publicError);
});

io.on('connection', function(client) {
    client.on('action', async function(action) {
        switch(action.type) {
        case actions.JOIN: {
            const subscription = await subscribeToMarkets(action.data, event => client.emit('action', event));
            client.on('disconnect', () => subscription.unsubscribe());
            break;
        }
        }
    });
});

server.listen(port, '0.0.0.0', function onStart(err) {
    if (err) {
        logger.error(err);
    }
    logger.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});

