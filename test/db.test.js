import * as db from '../src/db.js';
import assert from 'assert';

const info = {
  meta: {
    id: 'HP9000-CUSA03023_00-BLOODBORNE0000AS',
    name: 'Bloodborne™ The Old Hunters Edition (中英韩文版)',
    image: 'https://image.api.playstation.com/vulcan/img/rnd/202011/1317/YFfjfYkfbEkGxHIBzw9c7niJ.png',
    description: '["狩猎你的梦魇","出自『Demons Souls™』与『Dark Souls™』的制作团队之手，广受好评的本游戏已获得全世界超过200万名玩家的一致好评。","","古都雅南…位於遥远东方，人烟罕至山区的这座被遗忘的都市，","众所皆知是个被诅咒的城市，自古流传着一种叫做「怪兽瘟疫」的奇特地方性疾病。","罹患「怪兽瘟疫」的人，如同病名就像是被怪兽附身般，","丧失了身为人的理智，据说每晚「猎人」们都要去猎取已经不是人类的怪兽。","","Bloodborne™ The Old Hunters Edition收录The Old Hunters DLC，全新故事章节，您将可了解曾经活跃於雅南的古老猎人们的悲惨故事。","您亦可找到多种新服装和武器并增添至您猎人的武器库中，当中包含了可体验全新远程攻击的西蒙的弓刃。使用黑暗魔法让自己成为可怕的野兽吧。欢迎回到雅南...","","Copyright： ©2015 Sony Interactive Entertainment Inc. Developed by FromSoftware, Inc. "]',
    price: 26800
  },
  discounts: {
    base: { finalPrice: 9380, endTime: new Date('2021-03-17T15:59:00.000Z') },
    plus: null
  }
};

describe('database', () => {
  describe('initialization', () => {
    it('should empty tables of the database', () => {
      return db.sequelize.sync({ force: true })
        .then(() => {
          return db.exist('HP9000-CUSA03023_00-BLOODBORNE0000AS')
        }).then((val) => {
          assert.strictEqual(val, false);
        });
    })
  })
  describe('db.create', () => {
    // 用旧的时间插入
    it('should insert a new record to games', () => {
      return db.insertGame(info)
        .then(async (game) => {
          assert.strictEqual(game.price, 9380);
          await db.updateRecord(game);
          game.date = new Date('2020-3-17')
          game.price = 8080
          await db.updateRecord(game);
        })
    })
    it('should update a record', () => {
      info.discounts.base.finalPrice = 800;
      return db.updateGame(info)
        .then((game) => {
          assert.strictEqual(game.price, 800);
        })
    })
  })
})