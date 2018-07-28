import { compose } from 'compose-middleware';

export const errorHandlerMiddleware = compose([
  (req, res, next) => {
    next(new CustomError({
      status: 404,
      code: 'router/path-not-found',
      message: 'Request path is not exist.'
    }));
  },
  (err, req, res, next) => {
    // console.log('err', err)
    res.status(err.status || 400).send({
      error: {
        code: err.code,
        message: err.message,
        meta: err.meta,
        isCustom: err.isCustom,
        stack: err.stack
      }
    });
  }
]);

export default class CustomError extends Error {
  constructor({
    status, code, message, meta
  }) {
    super();

    this.status = status || 400;
    this.code = code || 'others/not-defined';
    this.message = message || '';
    this.meta = meta || {};
    this.isCustom = true;
  }
}
