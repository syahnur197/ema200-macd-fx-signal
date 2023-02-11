import dotenv from "dotenv";
import TelegramBot from 'node-telegram-bot-api';
import {CronJob} from 'cron'
import {PrismaClient} from "@prisma/client";
import {scanTradingView} from "./tradingview-scanner.js";
import {formatMessage, isNoSignal, isPerfectBuySignal, isPerfectSellSignal} from "./util.js";

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

    const prices = await fetchLatestDbPricesData('H1');

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

    if (process.env.ENABLE_D1 === 'true') {
        let prices = await fetchLatestDbPricesData('D1');

        let pricesWithSignal = [];

        // D1 signals
        prices.forEach(price => {
            if (!isNoSignal({
                close: price.d1_close,
                ema200: price.d1_ema200,
                macd: price.d1_macd,
                signal: price.d1_signal,
                histogram: price.d1_histogram,
            })) {
                pricesWithSignal.push(price)
            }
        })

        if (pricesWithSignal.length !== 0) {
            let message = formatMessage(pricesWithSignal, "D1");

            await bot.sendMessage(fromId, message)
        }
    }

    if (process.env.ENABLE_H4 === 'true') {
        let prices = await fetchLatestDbPricesData('H4');

        let pricesWithSignal = [];

        // H4 signals
        prices.forEach(price => {
            if (!isNoSignal({
                close: price.h4_close,
                ema200: price.h4_ema200,
                macd: price.h4_macd,
                signal: price.h4_signal,
                histogram: price.h4_histogram,
            })) {
                pricesWithSignal.push(price)
            }
        })

        if (pricesWithSignal.length !== 0) {
            let message = formatMessage(pricesWithSignal, "H4");

            await bot.sendMessage(fromId, message)
        }
    }

    if (process.env.ENABLE_H1 === 'true') {
        let prices = await fetchLatestDbPricesData('H1');

        let pricesWithSignal = [];

        // H1 signals
        prices.forEach(price => {
            if (!isNoSignal({
                close: price.h1_close,
                ema200: price.h1_ema200,
                macd: price.h1_macd,
                signal: price.h1_signal,
                histogram: price.h1_histogram,
            })) {
                pricesWithSignal.push(price)
            }
        })

        if (pricesWithSignal.length !== 0) {
            let message = formatMessage(pricesWithSignal, "H1");

            await bot.sendMessage(fromId, message)
        }
    }

    if (process.env.ENABLE_M30 === 'true') {
        let prices = await fetchLatestDbPricesData('M30');

        let pricesWithSignal = [];

        // M30 signals
        prices.forEach(price => {
            if (!isNoSignal({
                close: price.m30_close,
                ema200: price.m30_ema200,
                macd: price.m30_macd,
                signal: price.m30_signal,
                histogram: price.m30_histogram,
            })) {
                pricesWithSignal.push(price)
            }
        })

        if (pricesWithSignal.length !== 0) {
            let message = formatMessage(pricesWithSignal, "M30");

            await bot.sendMessage(fromId, message)
        }
    }

    if (process.env.ENABLE_M15 === 'true') {
        let prices = await fetchLatestDbPricesData('M15');

        let pricesWithSignal = [];

        // M15 signals
        prices.forEach(price => {
            if (!isNoSignal({
                close: price.m15_close,
                ema200: price.m15_ema200,
                macd: price.m15_macd,
                signal: price.m15_signal,
                histogram: price.m15_histogram,
            })) {
                pricesWithSignal.push(price)
            }
        })

        if (pricesWithSignal.length !== 0) {
            let message = formatMessage(pricesWithSignal, "M15");

            await bot.sendMessage(fromId, message)
        }
    }

    await bot.sendMessage(fromId, `Done`);
});

const sendMessageToUsers = (users, message) => users.forEach(user => bot.sendMessage(user.telegramId, message))

// DB Fetcher

const storePairData = async (pairData, timeframe = '') => {

    let pairDbData = [];

    let now = new Date();

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
            h4_macd: pairDatum.h4_macd,
            h4_signal: pairDatum.h4_signal,
            h4_histogram: pairDatum.h4_histogram,
            h4_ema200: pairDatum.h4_ema200,
            h4_close: pairDatum.h4_close,
            d1_macd: pairDatum.d1_macd,
            d1_signal: pairDatum.d1_signal,
            d1_histogram: pairDatum.d1_histogram,
            d1_ema200: pairDatum.d1_ema200,
            d1_close: pairDatum.d1_close,
            w1_ema200: pairDatum.w1_ema200,
            w1_close: pairDatum.w1_close,
            timeframe: timeframe,
            created_at: now,
        })
    })

    await prisma.price.createMany({
        data: pairDbData,
        skipDuplicates: true,
    })
}

const fetchLatestDbPricesData = async (timeframe) => prisma.$queryRaw`SELECT * FROM Price WHERE created_at = (SELECT MAX(created_at) FROM Price WHERE timeframe = ${timeframe} LIMIT 1)`;

const fetchAllUsersData = async () => prisma.user.findMany()

if (process.env.ENABLE_D1 === 'true') {
    new CronJob(
        '55 59 5 * * *', // 5 second before D1 candle closed
        async function () {
            const users = await fetchAllUsersData();
            sendMessageToUsers(users, 'Fetching data!');

            const oldPrices = await fetchLatestDbPricesData('D1');

            const pairData = await scanTradingView(pairs);

            await storePairData(pairData, 'D1')

            const newPrices = await fetchLatestDbPricesData('D1');

            let pricesWithSignal = [];

            newPrices.forEach(price => {

                let old_price_data = oldPrices.filter(oldPrice => oldPrice.pair === price.pair)[0]

                let new_price = {
                    close: price.d1_close,
                    ema200: price.d1_ema200,
                    macd: price.d1_macd,
                    signal: price.d1_signal,
                    histogram: price.d1_histogram,
                }

                let old_price = {
                    close: old_price_data.d1_close,
                    ema200: old_price_data.d1_ema200,
                    macd: old_price_data.d1_macd,
                    signal: old_price_data.d1_signal,
                    histogram: old_price_data.d1_histogram,
                }

                // only push if there's perfect trade signal and macd had a crossover
                if (isPerfectBuySignal(new_price) && old_price.macd <= 0) {
                    pricesWithSignal.push(price)
                } else if (isPerfectSellSignal(new_price) && old_price.macd >= 0) {
                    pricesWithSignal.push(price)
                }
            })


            if (pricesWithSignal.length === 0) {
                sendMessageToUsers(users, 'No trade signal for D1!');
                return;
            }

            const message = formatMessage(pricesWithSignal, "D1");

            sendMessageToUsers(users, message);
        },
        null,
        true,
        'Asia/Brunei'
    );
}

if (process.env.ENABLE_H4 === 'true') {
    new CronJob(
        '55 59 5,9,13,17,21,1 * * *', // 5s before H4 candle closed
        async function () {
            const users = await fetchAllUsersData();
            sendMessageToUsers(users, 'Fetching data!');

            const oldPrices = await fetchLatestDbPricesData('H4');

            const pairData = await scanTradingView(pairs);

            await storePairData(pairData, 'H4')

            const newPrices = await fetchLatestDbPricesData('H4');

            let pricesWithSignal = [];

            newPrices.forEach(price => {

                let old_price_data = oldPrices.filter(oldPrice => oldPrice.pair === price.pair)[0]

                let new_price = {
                    close: price.h4_close,
                    ema200: price.h4_ema200,
                    macd: price.h4_macd,
                    signal: price.h4_signal,
                    histogram: price.h4_histogram,
                }

                let old_price = {
                    close: old_price_data.h4_close,
                    ema200: old_price_data.h4_ema200,
                    macd: old_price_data.h4_macd,
                    signal: old_price_data.h4_signal,
                    histogram: old_price_data.h4_histogram,
                }

                // only push if there's perfect trade signal and macd had a crossover
                if (isPerfectBuySignal(new_price) && old_price.macd <= 0) {
                    pricesWithSignal.push(price)
                } else if (isPerfectSellSignal(new_price) && old_price.macd >= 0) {
                    pricesWithSignal.push(price)
                }
            })


            if (pricesWithSignal.length === 0) {
                sendMessageToUsers(users, 'No trade signal for H4!');
                return;
            }

            const message = formatMessage(pricesWithSignal, "H4");

            sendMessageToUsers(users, message);
        },
        null,
        true,
        'Asia/Brunei'
    );
}

if (process.env.ENABLE_H1 === 'true') {
    new CronJob(
        '55 59 * * * *', // 5s before H1 candle closed
        async function () {
            const users = await fetchAllUsersData();
            sendMessageToUsers(users, 'Fetching data!');

            const oldPrices = await fetchLatestDbPricesData('H1');

            const pairData = await scanTradingView(pairs);

            await storePairData(pairData, 'H1')

            const newPrices = await fetchLatestDbPricesData('H1');

            let pricesWithSignal = [];

            newPrices.forEach(price => {

                let old_price_data = oldPrices.filter(oldPrice => oldPrice.pair === price.pair)[0]

                let new_price = {
                    close: price.h1_close,
                    ema200: price.h1_ema200,
                    macd: price.h1_macd,
                    signal: price.h1_signal,
                    histogram: price.h1_histogram,
                }

                let old_price = {
                    close: old_price_data.h1_close,
                    ema200: old_price_data.h1_ema200,
                    macd: old_price_data.h1_macd,
                    signal: old_price_data.h1_signal,
                    histogram: old_price_data.h1_histogram,
                }

                // only push if there's perfect trade signal and macd had a crossover
                if (isPerfectBuySignal(new_price) && old_price.macd <= 0) {
                    pricesWithSignal.push(price)
                } else if (isPerfectSellSignal(new_price) && old_price.macd >= 0) {
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
}

if (process.env.ENABLE_M30 === 'true') {
    new CronJob(
        '55 29,59 * * * *', // 5s before M30 candle closed
        async function () {
            const users = await fetchAllUsersData();
            sendMessageToUsers(users, 'Fetching data!');

            const oldPrices = await fetchLatestDbPricesData('M30');

            const pairData = await scanTradingView(pairs);

            await storePairData(pairData, 'M30')

            const newPrices = await fetchLatestDbPricesData('M30');

            let pricesWithSignal = [];

            newPrices.forEach(price => {

                let old_price_data = oldPrices.filter(oldPrice => oldPrice.pair === price.pair)[0]

                let new_price = {
                    close: price.m30_close,
                    ema200: price.m30_ema200,
                    macd: price.m30_macd,
                    signal: price.m30_signal,
                    histogram: price.m30_histogram,
                }

                let old_price = {
                    close: old_price_data.m30_close,
                    ema200: old_price_data.m30_ema200,
                    macd: old_price_data.m30_macd,
                    signal: old_price_data.m30_signal,
                    histogram: old_price_data.m30_histogram,
                }

                // only push if there's perfect trade signal and macd had a crossover
                if (isPerfectBuySignal(new_price) && old_price.macd <= 0) {
                    pricesWithSignal.push(price)
                } else if (isPerfectSellSignal(new_price) && old_price.macd >= 0) {
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
}

if (process.env.ENABLE_M15 === 'true') {
    new CronJob(
        '55 14,29,44,59 * * * *', // 5S before M15 candle closed
        async function () {
            const users = await fetchAllUsersData();
            sendMessageToUsers(users, 'Fetching data!');

            const oldPrices = await fetchLatestDbPricesData('M15');

            const pairData = await scanTradingView(pairs);

            await storePairData(pairData, 'M15')

            const newPrices = await fetchLatestDbPricesData('M15');

            let pricesWithSignal = [];

            newPrices.forEach(price => {

                let old_price_data = oldPrices.filter(oldPrice => oldPrice.pair === price.pair)[0]

                let new_price = {
                    close: price.m15_close,
                    ema200: price.m15_ema200,
                    macd: price.m15_macd,
                    signal: price.m15_signal,
                    histogram: price.m15_histogram,
                }

                let old_price = {
                    close: old_price_data.m15_close,
                    ema200: old_price_data.m15_ema200,
                    macd: old_price_data.m15_macd,
                    signal: old_price_data.m15_signal,
                    histogram: old_price_data.m15_histogram,
                }

                // only push if there's perfect trade signal and macd had a crossover
                if (isPerfectBuySignal(new_price) && old_price.macd <= 0) {
                    pricesWithSignal.push(price)
                } else if (isPerfectSellSignal(new_price) && old_price.macd >= 0) {
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
}

(async () => {
    console.log('fetching pairs and indicator data')
    const pairData = await scanTradingView(pairs);

    if (process.env.ENABLE_D1 === 'true') {
        console.log("storing D1");
        await storePairData(pairData, 'D1');
    }

    if (process.env.ENABLE_H4 === 'true') {
        console.log("storing H4");
        await storePairData(pairData, 'H4');
    }

    if (process.env.ENABLE_H1 === 'true') {
        console.log("storing H1");
        await storePairData(pairData, 'H1');
    }

    if (process.env.ENABLE_M30 === 'true') {
        console.log("storing M30");
        await storePairData(pairData, 'M30');
    }

    if (process.env.ENABLE_M15 === 'true') {
        console.log("storing M15");
        await storePairData(pairData, 'M15');
    }
})()

