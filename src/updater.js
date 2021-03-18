import schedule from 'node-schedule';
import fetch from 'node-fetch';
import cheerio from 'cheerio';

import * as util from './util.js';
import * as db from './db.js';

async function fetchJSONS(id) {
  const html = await fetch(`https://store.playstation.com/zh-hans-hk/product/${id}`, {
    headers: {
      "Content-Type": "text/html",
    },
  }).then((res) => res.text());
  const $ = cheerio.load(html);
  return [
    JSON.parse($($('script[id="mfe-jsonld-tags"]')[0]).html() || ''),
    JSON.parse($(
      $('.cta-container-desktop script[type="application/json"][id^="env:"]')[0],
    ).html() || '').cache
  ];
}

function parseGame(id, gameinfo) {
  const [metaJSON, priceJSON] = gameinfo;
  const refs = priceJSON[`Product:${id}`]["webctas"].map((v) => v.__ref);

  console.log('成功从网络取得信息');
  // 元信息取值部分
  const { name, image, description: descriptionStr, offers } = metaJSON;
  const description = util.parseDescription(descriptionStr);
  let price = offers.price;

  // 折扣结果声明
  const discounts = {
    base: null,
    plus: null,
  };

  // 折扣结果定义
  refs.forEach((ref) => {
    const cta = priceJSON[ref];
    const { endTime, basePriceValue, discountedValue: finalPrice } = cta.price;
    const { upSellService } = cta.meta;
    const key = upSellService === "NONE" ? "base" : "plus";

    price = basePriceValue;
    if (endTime !== null) {
      discounts[key] = {
        finalPrice,
        endTime: new Date(+endTime),
      };
    }
  });

  // 元信息定义
  const meta = {
    id,
    name,
    image,
    description: JSON.stringify(description),
    price,
  };
  return { meta, discounts };
}

export async function fetchGame(id) {
  const gameinfo = await fetchJSONS(id);
  return parseGame(id, gameinfo);
}

/**
 *
 * @param {string} id
 */
export async function updateByID(id) {
  db.updateGame(await fetchGame(id));
}

export async function updateTask() {
  console.log('update task');
  for (const gameID of await db.queryAllGameIDs()) {
    console.log('准备更新', gameID)
    await updateByID(gameID);
    console.log(gameID, '完成');
  }
}

export async function run() {
  await updateTask();
  schedule.scheduleJob('0 0 * * * *', updateTask);
}
