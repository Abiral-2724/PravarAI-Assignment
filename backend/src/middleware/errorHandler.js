const { Prisma } = require('@prisma/client');
const { NODE_ENV } = require('../config/env');


module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Invalid JSON body';
  }

  
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (statusCode >= 500) {
    console.error(err);
    if (NODE_ENV === 'production') message = 'Internal server error';
  }

  res.status(statusCode).json({
    error: { message, ...(details && { details }) },
  });
};