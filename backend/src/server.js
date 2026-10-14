const app = require('./app');
const prisma = require('../prisma');
const { PORT } = require('./config/env');

const server = app.listen(PORT, () => {
  console.log(` API running on http://localhost:${PORT}`);
});




