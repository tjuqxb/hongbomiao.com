import './shared/utils/initTracer';
import http from 'http';
import Config from './Config';
import app from './app';
import initPostgres from './database/postgres/seeds/initPostgres';
import createTerminus from './health/utils/createTerminus';
import initSentry from './log/utils/initSentry';
import logger from './log/utils/logger';
import createHTTP2Server from './shared/utils/createHTTP2Server';
import isProduction from './shared/utils/isProduction';

initSentry();
initPostgres();

const server = isProduction() ? http.createServer(app) : createHTTP2Server(app);
const { nodeEnv, port } = Config;

server.listen(port, () => {
  logger.info('env', {
    nodeEnv,
    port,
  });
});

createTerminus(server);
