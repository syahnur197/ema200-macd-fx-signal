import dotenv from "dotenv";
import TelegramBot from 'node-telegram-bot-api';
import {CronJob} from 'cron'
import {PrismaClient} from "@prisma/client";
import {scanTradingView} from "./tradingview-scanner.js";
import {formatMessage, isNoSignal} from "./util.js";

dotenv.config()

const pairs = [
    'EURUSD',
    'GBPUSD',
    'AUDUSD',
    'NZDUSD',
    'USDJPY',
    'USDSGD',
    'USDCAD',
    'USDCHF',

    'GBPJPY',
    'EURJPY',
    'AUDJPY',
    'GBPAUD',
    'EURUAD',
    'EURGBP',
    'CADJPY',
    'AUDCAD',
    'EURCAD',
    'EURNZD',
    'NZDJPY',
    'GBPNZD',
    'GBPCAD',
    'GBPCHF',
    'AUDNZD',
    'AUDCHF',
    'EURCHF',
    'NZDCAD',
    'CADCHF',
    'CHFJPY',
    'NZDCHF',
    'USDZAR',
    'AUDSGD',
    'GBPSGD',
    'EURSGD',
    'SGDJPY',
];

const prisma = new PrismaClient()

const telegramBotToken = process.env.BOT_TOKEN; // Telegram bot
const cronExpression = process.env.CRON_EXPRESSION

const bot = new TelegramBot(telegramBotToken, {polling: true});

// Matches "/start"
bot.onText(/\/start/, async (msg, match) => {
    let fromId = msg.from.id;
    let name = msg.from.first_name;

    const userCount = await prisma.user.count({
        where: {telegramId: fromId}
    });

    if (userCount > 0) {
        await bot.sendMessage(fromId, `${name}, you already joined the signal group!`);
        return;
    }

    await prisma.user.upsert({
        where: {telegramId: fromId},
        update: {telegramId: fromId},
        create: {
            telegramId: fromId,
        }
    })

    // send back the matched "whatever" to the chat
    await bot.sendMessage(fromId, `Welcome ${name}, thank you for joining the signal group`);
});

bot.onText(/\/quit/, async (msg, match) => {
    let fromId = msg.from.id;
    let name = msg.from.first_name;

    const userCount = await prisma.user.count({
        where: {telegramId: fromId}
    });

    if (userCount < 1) {
        await bot.sendMessage(fromId, `${name}, you already quit the signal group!`);
        return;
    }

    await prisma.user.delete({
        where: {telegramId: fromId},
    })

    await bot.sendMessage(fromId, `We're sad to see you leave this signal group ${name}, see you in the future!`);
});

// Send all pair market info
bot.onText(/\/trend/, async (msg, match) => {
    let fromId = msg.from.id;

    await bot.sendMessage(fromId, `Fetching signal`);

    const prices = await fetchLatestDbPricesData();

    if (prices.length === 0) {
        await bot.sendMessage(fromId, 'No historical price data found!');
        return;
    }

    const message = formatMessage(prices, "H1");

    await bot.sendMessage(fromId, message)
});

// Send pair with signal only
bot.onText(/\/signal/, async (msg, match) => {
    let fromId = msg.from.id;

    await bot.sendMessage(fromId, `Fetching signal`);

    const prices = await fetchLatestDbPricesData();

    let pricesWithSignal = [];

    // H1 signals
    prices.forEach(price => {
        if (!isNoSignal(price.h1_close, price.h1_ema200, price.h1_macd, price.h1_signal, price.h1_histogram)) {
            pricesWithSignal.push(price)
        }
    })

    if (pricesWithSignal.length !== 0) {
        let message = formatMessage(pricesWithSignal, "H1");

        await bot.sendMessage(fromId, message)
    }

    // M30 signals
    prices.forEach(price => {
        if (!isNoSignal(price.m30_close, price.m30_ema200, price.m30_macd, price.m30_signal, price.m30_histogram)) {
            pricesWithSignal.push(price)
        }
    })

    if (pricesWithSignal.length !== 0) {
        let message = formatMessage(pricesWithSignal, "M30");

        await bot.sendMessage(fromId, message)
    }

    // M15 signals
    prices.forEach(price => {
        if (!isNoSignal(price.m15_close, price.m15_ema200, price.m15_macd, price.m15_signal, price.m15_histogram)) {
            pricesWithSignal.push(price)
        }
    })

    if (pricesWithSignal.length !== 0) {
        let message = formatMessage(pricesWithSignal, "M15");

        await bot.sendMessage(fromId, message)
    }

});

const sendMessageToUsers = (users, message) => users.forEach(user => bot.sendMessage(user.telegramId, message))

// DB Fetcher

const fetchLatestTradingViewPairData = async () => {
    console.log('fetching pairs and indicator data')
    const pairData = await scanTradingView(pairs);

    let pairDbData = [];

    pairData.forEach((pairDatum) => {
        pairDbData.push({
            pair: pairDatum.pair,
            m5_macd: pairDatum.m5_macd,
            m5_signal: pairDatum.m5_signal,
            m5_histogram: pairDatum.m5_histogram,
            m5_ema200: pairDatum.m5_ema200,
            m5_close: pairDatum.m5_close,
            m15_macd: pairDatum.m15_macd,
            m15_signal: pairDatum.m15_signal,
            m15_histogram: pairDatum.m15_histogram,
            m15_ema200: pairDatum.m15_ema200,
            m15_close: pairDatum.m15_close,
            m30_macd: pairDatum.m30_macd,
            m30_signal: pairDatum.m30_signal,
            m30_histogram: pairDatum.m30_histogram,
            m30_ema200: pairDatum.m30_ema200,
            m30_close: pairDatum.m30_close,
            h1_macd: pairDatum.h1_macd,
            h1_signal: pairDatum.h1_signal,
            h1_histogram: pairDatum.h1_histogram,
            h1_ema200: pairDatum.h1_ema200,
            h1_close: pairDatum.h1_close,
            h4_ema200: pairDatum.h4_ema200,
            h4_close: pairDatum.h4_close,
            d1_ema200: pairDatum.d1_ema200,
            d1_close: pairDatum.d1_close,
            w1_ema200: pairDatum.w1_ema200,
            w1_close: pairDatum.w1_close,
            created_at: new Date(),
        })
    })

    await prisma.price.createMany({
        data: pairDbData,
        skipDuplicates: true,
    })
}

const fetchLatestDbPricesData = async () => prisma.$queryRaw`SELECT * FROM Price WHERE created_at = (SELECT MAX(created_at) FROM Price LIMIT 1)`;

const fetchAllUsersData = async () => prisma.user.findMany()

new CronJob(
    '0 1 * * * *', // every 1st minute of the hour
    async function () {
        const users = await fetchAllUsersData();
        sendMessageToUsers(users, 'Fetching data!');

        await fetchLatestTradingViewPairData()

        const prices = await fetchLatestDbPricesData();

        let pricesWithSignal = [];

        prices.forEach(price => {
            if (!isNoSignal(price.h1_close, price.h1_ema200, price.h1_macd, price.h1_signal, price.h1_histogram)) {
                pricesWithSignal.push(price)
            }
        })


        if (pricesWithSignal.length === 0) {
            sendMessageToUsers(users, 'No trade signal for H1!');
            return;
        }

        const message = formatMessage(pricesWithSignal, "H1");

        sendMessageToUsers(users, message);
    },
    null,
    true,
    'Asia/Brunei'
);

new CronJob(
    '0 */30 * * * *', // every 30 minute
    async function () {
        const users = await fetchAllUsersData();
        sendMessageToUsers(users, 'Fetching data!');

        await fetchLatestTradingViewPairData()

        const prices = await fetchLatestDbPricesData();

        let pricesWithSignal = [];

        prices.forEach(price => {
            if (!isNoSignal(price.m30_close, price.m30_ema200, price.m30_macd, price.m30_signal, price.m30_histogram)) {
                pricesWithSignal.push(price)
            }
        })

        if (pricesWithSignal.length === 0) {
            return;
        }

        const message = formatMessage(pricesWithSignal, "M30");

        sendMessageToUsers(users, message);
    },
    null,
    true,
    'Asia/Brunei'
);

new CronJob(
    '0 */15 * * * *', // every 15 minute
    async function () {
        const users = await fetchAllUsersData();
        sendMessageToUsers(users, 'Fetching data!');

        await fetchLatestTradingViewPairData()

        const prices = await fetchLatestDbPricesData();

        let pricesWithSignal = [];

        prices.forEach(price => {
            if (!isNoSignal(price.m15_close, price.m15_ema200, price.m15_macd, price.m15_signal, price.m15_histogram)) {
                pricesWithSignal.push(price)
            }
        })

        if (pricesWithSignal.length === 0) {
            return;
        }

        const message = formatMessage(pricesWithSignal, "M15");

        sendMessageToUsers(users, message);
    },
    null,
    true,
    'Asia/Brunei'
);

fetchLatestTradingViewPairData();

