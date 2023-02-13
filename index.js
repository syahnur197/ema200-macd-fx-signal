import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import { CronJob } from "cron";
import { PrismaClient } from "@prisma/client";
import { scanTradingView } from "./tradingview-scanner.js";
import {
  formatSignalMessage,
  isNoSignal,
  isBuySignal,
  isSellSignal,
} from "./util.js";

dotenv.config();

const pairs = [
  "EURUSD",
  "GBPUSD",
  "AUDUSD",
  "NZDUSD",
  "USDJPY",
  "USDSGD",
  "USDCAD",
  "USDCHF",

  "GBPJPY",
  "EURJPY",
  "AUDJPY",
  "GBPAUD",
  "EURUAD",
  "EURGBP",
  "CADJPY",
  "AUDCAD",
  "EURCAD",
  "EURNZD",
  "NZDJPY",
  "GBPNZD",
  "GBPCAD",
  "GBPCHF",
  "AUDNZD",
  "AUDCHF",
  "EURCHF",
  "NZDCAD",
  "CADCHF",
  "CHFJPY",
  "NZDCHF",
  "USDZAR",
  "AUDSGD",
  "GBPSGD",
  "EURSGD",
  "SGDJPY",
];

// all the alerts will fetch market data 5 seconds before respective
// timeframe candle closed because it will fetch the new candle
// value if we set exactly when the candle closed
const cronSetups = [
  {
    timeframe: "W1",
    cron: "55 59 5 1 * *",
    alert: process.env.ENABLE_W1 === "true",
  },
  {
    timeframe: "D1",
    cron: "55 59 5 * * *",
    alert: process.env.ENABLE_D1 === "true",
  },
  {
    timeframe: "H4",
    cron: "55 59 5,9,13,17,21,1 * * *",
    alert: process.env.ENABLE_H4 === "true",
  },
  {
    timeframe: "H1",
    cron: "55 59 * * * *",
    alert: process.env.ENABLE_H1 === "true",
  },
  {
    timeframe: "M30",
    cron: "55 29,59 * * * *",
    alert: process.env.ENABLE_M30 === "true",
  },
  {
    timeframe: "M15",
    cron: "55 14,29,44,59 * * * *",
    alert: process.env.ENABLE_M15 === "true",
  },
];

const prisma = new PrismaClient();

const telegramBotToken = process.env.BOT_TOKEN;

const bot = new TelegramBot(telegramBotToken, { polling: true });

const commands = [
  {
    command: "start",
    description: "Start the bot and subscribe to the signal alert",
  },
  {
    command: "quit",
    description: "Unsubscribe to the signal alert",
  },
  {
    command: "trend",
    description: "Request for the latest trend",
  },
  {
    command: "signal",
    description: "Request for the latest signal",
  },
];

bot.setMyCommands(commands);

// Matches "/start"
bot.onText(/\/start/, async (msg, match) => {
  let fromId = msg.from.id;
  let name = msg.from.first_name;

  const userCount = await prisma.user.count({
    where: { telegramId: fromId },
  });

  if (userCount > 0) {
    await bot.sendMessage(
      fromId,
      `${name}, you already subscribed to the signal!`
    );
    return;
  }

  await prisma.user.upsert({
    where: { telegramId: fromId },
    update: { telegramId: fromId },
    create: {
      telegramId: fromId,
    },
  });

  // send back the matched "whatever" to the chat
  await bot.sendMessage(
    fromId,
    `Welcome ${name}, thank you for subscribing to the signal! You will receive trading signals periodically.`
  );
});

bot.onText(/\/quit/, async (msg, match) => {
  let fromId = msg.from.id;
  let name = msg.from.first_name;

  const userCount = await prisma.user.count({
    where: { telegramId: fromId },
  });

  if (userCount < 1) {
    await bot.sendMessage(
      fromId,
      `${name}, you already unsubscribed from the signal alert!`
    );
    return;
  }

  await prisma.user.delete({
    where: { telegramId: fromId },
  });

  await bot.sendMessage(fromId, `You have unsubscribed from the signal alert!`);
});

// Send all pair market info
bot.onText(/\/trend/, async (msg, match) => {
  let fromId = msg.from.id;

  await bot.sendMessage(fromId, `Fetching signal`);

  const latestPrices = await fetchAllTimeframeLatestPricesData();

  if (latestPrices.length === 0) {
    await bot.sendMessage(fromId, "No historical price data found!");
    return;
  }

  const message = formatSignalMessage(latestPrices, "H1");

  await bot.sendMessage(fromId, message);
});

// Send pair with signal only
bot.onText(/\/signal/, async (msg, match) => {
  let fromId = msg.from.id;

  await bot.sendMessage(fromId, `Fetching signal`);

  const latestPrices = await fetchAllTimeframeLatestPricesData();

  for (let i = 0; i < cronSetups.length; i++) {
    const cronSetup = cronSetups[i];

    if (!cronSetup.alert) continue;

    let pricesWithSignal = [];

    latestPrices.forEach((price) => {
      if (!isNoSignal(price[cronSetup.timeframe])) {
        pricesWithSignal.push(price);
      }
    });

    if (pricesWithSignal.length !== 0) {
      let message = formatSignalMessage(pricesWithSignal, cronSetup.timeframe);

      await bot.sendMessage(fromId, message);
    }
  }

  await bot.sendMessage(fromId, `Done`);
});

const sendMessageToUsers = (users, message) =>
  users.forEach((user) => bot.sendMessage(user.telegramId, message));

// DB Fetcher

const storePairData = async (pairData, timeframe = "") => {
  let pairDbData = [];

  let now = new Date();

  pairData.forEach((pairDatum) => {
    for (const [key, value] of Object.entries(pairDatum.timeframe)) {
      // if timeframe is provided, and it is not equal to the key, then we
      // don't have to store it, because we don't want to store the other timeframe data
      if (timeframe !== "" && timeframe !== key) continue;

      pairDbData.push({
        pair: pairDatum.pair,
        macd: value.macd,
        signal: value.signal,
        histogram: value.histogram,
        ema200: value.ema200,
        close: value.close,
        timeframe: key,
        created_at: now,
      });
    }
  });

  await prisma.price.createMany({
    data: pairDbData,
    skipDuplicates: true,
  });
};

const fetchLatestDbPricesData = async (timeframe) =>
  prisma.$queryRaw`SELECT * FROM Price WHERE created_at = (SELECT MAX(created_at) FROM Price WHERE timeframe = ${timeframe} LIMIT 1)`;

const fetchAllTimeframeLatestPricesData = async () => {
  let w1Prices = await fetchLatestDbPricesData("W1");
  let d1Prices = await fetchLatestDbPricesData("D1");
  let h4Prices = await fetchLatestDbPricesData("H4");
  let h1Prices = await fetchLatestDbPricesData("H1");
  let m30Prices = await fetchLatestDbPricesData("M30");
  let m15Prices = await fetchLatestDbPricesData("M15");

  return w1Prices.map((w1Price) => {
    let currentPair = w1Price.pair;
    let d1Price = d1Prices.filter((d1Price) => d1Price.pair === currentPair)[0];
    let h4Price = h4Prices.filter((h4Price) => h4Price.pair === currentPair)[0];
    let h1Price = h1Prices.filter((h1Price) => h1Price.pair === currentPair)[0];
    let m30Price = m30Prices.filter(
      (m30Price) => m30Price.pair === currentPair
    )[0];
    let m15Price = m15Prices.filter(
      (m15Price) => m15Price.pair === currentPair
    )[0];

    return {
      W1: {
        pair: currentPair,
        macd: w1Price.macd,
        signal: w1Price.signal,
        histogram: w1Price.histogram,
        close: w1Price.close,
        ema200: w1Price.ema200,
      },
      D1: {
        pair: currentPair,
        macd: d1Price.macd,
        signal: d1Price.signal,
        histogram: d1Price.histogram,
        close: d1Price.close,
        ema200: d1Price.ema200,
      },
      H4: {
        pair: currentPair,
        macd: h4Price.macd,
        signal: h4Price.signal,
        histogram: h4Price.histogram,
        close: h4Price.close,
        ema200: h4Price.ema200,
      },
      H1: {
        pair: currentPair,
        macd: h1Price.macd,
        signal: h1Price.signal,
        histogram: h1Price.histogram,
        close: h1Price.close,
        ema200: h1Price.ema200,
      },
      M30: {
        pair: currentPair,
        macd: m30Price.macd,
        signal: m30Price.signal,
        histogram: m30Price.histogram,
        close: m30Price.close,
        ema200: m30Price.ema200,
      },
      M15: {
        pair: currentPair,
        macd: m15Price.macd,
        signal: m15Price.signal,
        histogram: m15Price.histogram,
        close: m15Price.close,
        ema200: m15Price.ema200,
      },
    };
  });
};

const fetchAllUsersData = async () => prisma.user.findMany();

for (let i = 0; i < cronSetups.length; i++) {
  let cronSetup = cronSetups[i];

  new CronJob(
    cronSetup.cron,
    async function () {
      const users = await fetchAllUsersData();

      // retrieve old data to determine if there's a cross
      const oldPrices = await fetchLatestDbPricesData(cronSetup.timeframe);

      console.log(`fetching ${cronSetup.timeframe}`);
      const pairData = await scanTradingView(pairs);

      console.log(`storing ${cronSetup.timeframe}`);
      await storePairData(pairData, cronSetup.timeframe);

      if (!cronSetup.alert) return;

      console.log(`fetch all ${cronSetup.timeframe}`);
      const latestPrices = await fetchAllTimeframeLatestPricesData();

      let pricesWithSignal = [];

      latestPrices.forEach((price) => {
        let old_price_data = oldPrices.filter(
          (oldPrice) => oldPrice.pair === price[cronSetup.timeframe].pair
        )[0];

        // only push if there's perfect trade signal and macd had a cross with signal line
        const buyCondition =
          isBuySignal(price[cronSetup.timeframe]) &&
          old_price_data.histogram <= 0;

        const sellCondition =
          isSellSignal(price[cronSetup.timeframe]) &&
          old_price_data.histogram >= 0;

        if (buyCondition || sellCondition) {
          pricesWithSignal.push(price);
        }
      });

      if (pricesWithSignal.length === 0) {
        sendMessageToUsers(users, `No signal for ${cronSetup.timeframe}`);
        return;
      }

      const message = formatSignalMessage(
        pricesWithSignal,
        cronSetup.timeframe
      );

      sendMessageToUsers(users, message);
    },
    null,
    true,
    process.env.TIMEZONE
  );
}

(async () => {
  console.log("fetching pairs and indicator data");
  const pairData = await scanTradingView(pairs);
  await storePairData(pairData, "W1");
  await storePairData(pairData, "D1");
  await storePairData(pairData, "H4");
  await storePairData(pairData, "H1");
  await storePairData(pairData, "M30");
  await storePairData(pairData, "M15");
})();
