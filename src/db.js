import sequelizePkg from 'sequelize';
import moment from 'moment';

const { Sequelize, Model, DataTypes } = sequelizePkg;

export const sequelize = new Sequelize('gameon', 'root', 'zWe(80)E', {
  host: '159.75.113.151',
  dialect: 'mysql',
  logging: false,
});

export class GameMeta extends Model { }
export class Discount extends Model { };
export class Record extends Model { };
GameMeta.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'game',
  timestamps: false,
});
Discount.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    references: {
      model: GameMeta,
      key: 'id'
    },
  },
  basePrice: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  baseEndAt: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  plusPrice: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  plusEndAt: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'discount',
  timestamps: false,
});
Record.init({
  no: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: GameMeta,
      key: 'id'
    },
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'record',
  timestamps: false,
});

/**
 *
 * @param {string} id
 */
export async function queryGameByID(id) {
  const meta = (await GameMeta.findByPk(id))?.toJSON() ?? null;
  if (meta === null) return null;
  const discount = await Discount.findByPk(id);
  let base = null, plus = null;
  const basePrice = discount.getDataValue('basePrice'),
    baseEndAt = discount.getDataValue('baseEndAt'),
    plusPrice = discount.getDataValue('plusPrice'),
    plusEndAt = discount.getDataValue('plusEndAt');
  if (basePrice && baseEndAt) {
    base = {
      finalPrice: basePrice,
      endTime: baseEndAt,
    }
  }
  if (plusPrice && plusEndAt) {
    plus = {
      finalPrice: plusPrice,
      endTime: plusEndAt,
    }
  }
  const game = {
    meta,
    discounts: {
      base,
      plus
    }
  }
  return game;
}

export async function queryAllGameIDs() {
  return (await GameMeta.findAll({ attributes: ['id'] })).map((game) => game.getDataValue('id'));
}

export async function queryAllGameJSONs() {
  const games = await queryAllGameIDs();
  const res = [];
  for (const game of games) {
    res.push(await queryGameByID(game));
  }
  return res;
}

/**
 *
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function exist(id) {
  return (await GameMeta.count({ where: { id } }) !== 0);
}

/**
 *
 * @param {any} game
 * @returns {Promise<{date: Date, price: number, id: string}>}
 */
export async function insertGame(game) {
  const { base, plus } = game.discounts;
  const price = base?.finalPrice ?? game.meta.price ?? 0;
  await GameMeta.create(game.meta);
  await Discount.create({
    id: game.meta.id,
    basePrice: base?.finalPrice,
    baseEndAt: base?.endTime,
    plusPrice: plus?.finalPrice,
    plusEndAt: plus?.endTime,
  });
  return {
    id: game.meta.id,
    date: new Date(),
    price,
  };
}

/**
 *
 * @param {any} game
 * @returns {Promise<{date: Date, price: number, id: string}>}
 */
export async function updateGame(game) {
  const { meta, discounts } = game;
  if (!exist(meta.id)) {
    insertGame(game);
    return;
  }
  const { base, plus } = discounts;
  const gameMeta = await GameMeta.findByPk(meta.id);
  const discount = await Discount.findByPk(meta.id);

  const price = base?.finalPrice ?? game.meta.price ?? 0;

  ['name', 'description', 'image', 'price']
    .forEach((field) => {
      gameMeta.setDataValue(field, game.meta[field]);
    });

  // 更新折扣信息
  discount.setDataValue('basePrice', base?.finalPrice)
  discount.setDataValue('baseEndAt', base?.endTime)
  discount.setDataValue('plusPrice', plus?.finalPrice)
  discount.setDataValue('plusEndAt', plus?.endTime)

  await gameMeta.save();
  await discount.save();

  return {
    id: meta.id,
    date: new Date(),
    price,
  };
}

/**
 *
 * @param {{date: Date, price: number, id: string}} game
 */
export async function insertRecord(game) {
  await Record.create(game);
  return true;
}

/**
 *
 * @param {{date: Date, price: number, id: string}} game
 */
export async function updateRecord(game) {
  // 查询最后一条记录
  const { id, date, price } = game;
  const records = await Record.findAll({
    where: { id },
  })

  const today = moment(date).format('YYYY-MM-DD')
  const lastRecord = records.pop();
  if (!lastRecord) {
    return await insertRecord(game);
  }
  const lastRecordJSON = lastRecord.toJSON();
  const isToday = lastRecordJSON['date'] === today;
  const isPrice = lastRecordJSON['price'] === price;

  // 首先判断价格，然后判断时间.
  if (isPrice) {
    return false;
  } else if (isToday) {
    // 更新
    lastRecord.setDataValue('price', price);
    return true;
  } else {
    // 插入
    return await insertRecord(game);
  }
}
