import path from 'path';
import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import express from 'express';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import NEL from 'network-error-logging';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import reportTo from 'report-to';
import handleError from './error/controllers/handleError';
import morganMiddleware from './log/middlewares/morgan.middleware';
import sendIndexPage from './page/controllers/sendIndexPage';
import corsMiddleware from './security/middlewares/cors.middleware';
import helmetMiddleware from './security/middlewares/helmet.middleware';
import rateLimitMiddleware from './security/middlewares/rateLimit.middleware';
import redirectSSLMiddleware from './security/middlewares/redirectSSL.middleware';
import graphQLMiddleware from './shared/middlewares/graphQL.middleware';
import apiRouter from './shared/routers/api.router';

const app = express()
  .use(Sentry.Handlers.requestHandler()) // Must be the first middleware on the app
  .use(morganMiddleware())
  .use(corsMiddleware())
  .use(helmetMiddleware())
  .use(
    reportTo({
      groups: [
        {
          group: 'default',
          max_age: 31536000,
          endpoints: [
            {
              url: 'https://hongbomiao.report-uri.com/a/d/g',
              priority: 1,
            },
          ],
          include_subdomains: true,
        },
      ],
    })
  )
  .use(
    NEL({
      report_to: 'default',
      max_age: 31536000,
      include_subdomains: true,
    })
  )
  .use(redirectSSLMiddleware())
  .get('/', sendIndexPage)
  .use(express.static(path.join(__dirname, '../dist')))
  .use(rateLimitMiddleware())
  .use(bodyParser.json())
  .use('/graphql', graphQLMiddleware)
  .use('/api', apiRouter)
  .use(Sentry.Handlers.errorHandler()) // Must be before any other error middleware and after all controllers
  .use(handleError);

export default app;
