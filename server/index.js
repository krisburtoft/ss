const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../webpack.config.js');
const setUpSocket = require('./order-books');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3000 : process.env.PORT;
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const logger = require('./util/logger')('server');
const dirName = path.dirname(require.main.filename);

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

setUpSocket(io);


server.listen(port, '0.0.0.0', function onStart(err) {
    if (err) {
        logger.error(err);
    }
    logger.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});

