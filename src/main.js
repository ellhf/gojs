import app from './app.js'
import * as updater from './updater.js';

(async () => {
  // await sequelize.sync({ force: true });
  // await GameMeta.create({ id: 'HP9000-CUSA03023_00-BLOODBORNE0000AS' })
  updater.run();
  app.listen(8001);
})()
