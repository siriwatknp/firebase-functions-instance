/* eslint-disable no-unused-vars */
export const routeHandlerMiddleware = (req, res, next) => {
  next(new CustomError({
    status: 404,
    code: 'router/path-not-found',
    message: 'Request path is not exist.'
  }));
};

export const errorHandlerMiddleware = (err, req, res, next) => {
  res.status(err.status || 400).send({
    code: err.code,
    message: err.message,
    meta: err.meta,
    isCustom: err.isCustom,
    stack: err.stack
  });
};

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
