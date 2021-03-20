import app from './app.js'
import * as updater from './updater.js';

(async () => {
  // await db.sequelize.sync({ force: true });
  updater.run();
  app.listen(8001);
})()
