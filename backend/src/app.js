const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { CLIENT_URL, NODE_ENV } = require('./config/env');
const leadRoutes = require('./routes/lead.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json({ limit: '100kb' }));
if (NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/leads', leadRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;