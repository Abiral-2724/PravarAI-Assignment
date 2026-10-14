const { ZodError } = require('zod');
const AppError = require('../utils/AppError');


const validate = (schemas) => (req, res, next) => {
  try {
    req.validated = req.validated || {};
    for (const key of ['params', 'query', 'body']) {
      if (schemas[key]) {
        req.validated[key] = schemas[key].parse(req[key]);
      }
    }
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues.map((i) => ({
        field: i.path.join('.'),
        message: i.message,
      }));
      return next(new AppError(400, 'Validation failed', details));
    }
    next(err);
  }
};

module.exports = validate;