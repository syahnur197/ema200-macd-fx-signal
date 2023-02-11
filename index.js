import dotenv from "dotenv";
import TelegramBot from 'node-telegram-bot-api';
import {CronJob} from 'cron'
import {PrismaClient} from "@prisma/client";
import {scanTradingView} from "./tradingview-scanner.js";
import {formatSignalMessage, isNoSignal, isPerfectBuySignal, isPerfectSellSignal} from "./util.js";

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

    const message = formatSignalMessage(prices, "H1");

    await bot.sendMessage(fromId, message)
});

// Send pair with signal only
bot.onText(/\/signal/, async (msg, match) => {
    let fromId = msg.from.id;

    await bot.sendMessage(fromId, `Fetching signal`);

    const latestPrices = await fetchAllTimeframeLatestPricesData()

    if (process.env.ENABLE_D1 === 'true') {
        let pricesWithSignal = [];

        // D1 signals
        latestPrices.forEach(price => {
            if (!isNoSignal(price["D1"])) {
                pricesWithSignal.push(price)
            }
        })

        if (pricesWithSignal.length !== 0) {
            let message = formatSignalMessage(pricesWithSignal, "D1");

            await bot.sendMessage(fromId, message)
        }
    }

    if (process.env.ENABLE_H4 === 'true') {
        let pricesWithSignal = [];

        // H4 signals
        latestPrices.forEach(price => {
            if (!isNoSignal(price["H4"])) {
                pricesWithSignal.push(price)
            }
        })

        if (pricesWithSignal.length !== 0) {
            let message = formatSignalMessage(pricesWithSignal, "H4");

            await bot.sendMessage(fromId, message)
        }
    }

    if (process.env.ENABLE_H1 === 'true') {
        let pricesWithSignal = [];

        // H1 signals
        latestPrices.forEach(price => {
            if (!isNoSignal(["H1"])) {
                pricesWithSignal.push(price)
            }
        })

        if (pricesWithSignal.length !== 0) {
            let message = formatSignalMessage(pricesWithSignal, "H1");

            await bot.sendMessage(fromId, message)
        }
    }

    if (process.env.ENABLE_M30 === 'true') {
        let pricesWithSignal = [];

        // M30 signals
        latestPrices.forEach(price => {
            if (!isNoSignal(price["M30"])) {
                pricesWithSignal.push(price)
            }
        })

        if (pricesWithSignal.length !== 0) {
            let message = formatSignalMessage(pricesWithSignal, "M30");

            await bot.sendMessage(fromId, message)
        }
    }

    if (process.env.ENABLE_M15 === 'true') {

        let pricesWithSignal = [];

        // M15 signals
        latestPrices.forEach(price => {
            if (!isNoSignal(price["M15"])) {
                pricesWithSignal.push(price)
            }
        })

        if (pricesWithSignal.length !== 0) {
            let message = formatSignalMessage(pricesWithSignal, "M15");

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
        for (const [key, value] of Object.entries(pairDatum.timeframe)) {

            // if timeframe is provided, and it is not equal to the key, then we
            // don't have to store it, because we don't want to store the other timeframe data
            if (timeframe !== '' && timeframe !== key) continue;

            pairDbData.push({
                pair: pairDatum.pair,
                macd: value.macd,
                signal: value.signal,
                histogram: value.histogram,
                ema200: value.ema200,
                close: value.close,
                timeframe: key,
                created_at: now,
            })
        }
    })

    await prisma.price.createMany({
        data: pairDbData,
        skipDuplicates: true,
    })
}

const fetchLatestDbPricesData = async (timeframe) => prisma.$queryRaw`SELECT * FROM Price WHERE created_at = (SELECT MAX(created_at) FROM Price WHERE timeframe = ${timeframe} LIMIT 1)`;

const fetchAllTimeframeLatestPricesData = async () => {
    let w1Prices = await fetchLatestDbPricesData('W1');
    let d1Prices = await fetchLatestDbPricesData('D1');
    let h4Prices = await fetchLatestDbPricesData('H4');
    let h1Prices = await fetchLatestDbPricesData('H1');
    let m30Prices = await fetchLatestDbPricesData('M30');
    let m15Prices = await fetchLatestDbPricesData('M15');

    return w1Prices.map(w1Price => {
        let currentPair = w1Price.pair;
        let d1Price = d1Prices.filter(d1Price => d1Price.pair === currentPair)[0];
        let h4Price = h4Prices.filter(h4Price => h4Price.pair === currentPair)[0];
        let h1Price = h1Prices.filter(h1Price => h1Price.pair === currentPair)[0];
        let m30Price = m30Prices.filter(m30Price => m30Price.pair === currentPair)[0];
        let m15Price = m15Prices.filter(m15Price => m15Price.pair === currentPair)[0];

        return {
            "W1": {
                pair: currentPair,
                macd: w1Price.macd,
                signal: w1Price.signal,
                histogram: w1Price.histogram,
                close: w1Price.close,
                ema200: w1Price.ema200,
            },
            "D1": {
                pair: currentPair,
                macd: d1Price.macd,
                signal: d1Price.signal,
                histogram: d1Price.histogram,
                close: d1Price.close,
                ema200: d1Price.ema200,
            },
            "H4": {
                pair: currentPair,
                macd: h4Price.macd,
                signal: h4Price.signal,
                histogram: h4Price.histogram,
                close: h4Price.close,
                ema200: h4Price.ema200,
            },
            "H1": {
                pair: currentPair,
                macd: h1Price.macd,
                signal: h1Price.signal,
                histogram: h1Price.histogram,
                close: h1Price.close,
                ema200: h1Price.ema200,
            },
            "M30": {
                pair: currentPair,
                macd: m30Price.macd,
                signal: m30Price.signal,
                histogram: m30Price.histogram,
                close: m30Price.close,
                ema200: m30Price.ema200,
            },
            "M15": {
                pair: currentPair,
                macd: m15Price.macd,
                signal: m15Price.signal,
                histogram: m15Price.histogram,
                close: m15Price.close,
                ema200: m15Price.ema200,
            },
        }
    })

}

const fetchAllUsersData = async () => prisma.user.findMany()

const cronSetups = [
    {
        timeframe: "W1",
        cron: "55 59 5 1 * *",
        alert: false,
    },
    {
        timeframe: "D1",
        cron: "55 59 5 * * *",
        alert: true,
    },
    {
        timeframe: "H4",
        cron: "55 59 5,9,13,17,21,1 * * *",
        alert: true,
    },
    {
        timeframe: "H1",
        cron: "55 59 * * * *",
        alert: true,
    },
    {
        timeframe: "M30",
        cron: "55 29,59 * * * *",
        alert: false,
    },
    {
        timeframe: "M15",
        cron: "55 14,29,44,59 * * * *",
        alert: false,
    },
]

for (let i = 0; i < cronSetups.length; i++) {
    let cronSetup = cronSetups[i];

    new CronJob(
        cronSetup.cron, // 5S before M15 candle closed
        async function () {
            const users = await fetchAllUsersData();
            sendMessageToUsers(users, `Fetching data ${cronSetup.timeframe}!`);

            const oldPrices = await fetchLatestDbPricesData(cronSetup.timeframe);

            const pairData = await scanTradingView(pairs);

            await storePairData(pairData, cronSetup.timeframe)

            if (!cronSetup.alert) return;

            const latestPrices = await fetchAllTimeframeLatestPricesData()

            let pricesWithSignal = [];

            latestPrices.forEach(price => {

                let old_price_data = oldPrices.filter(oldPrice => oldPrice.pair === price.pair)[0]

                // only push if there's perfect trade signal and macd had a crossover
                if (isPerfectBuySignal(price[cronSetup.timeframe])) {
                    pricesWithSignal.push(price)
                } else if (isPerfectSellSignal(price[cronSetup.timeframe])) {
                    pricesWithSignal.push(price)
                } else {
                    pricesWithSignal.push(price)
                }
            })

            if (pricesWithSignal.length === 0) {
                sendMessageToUsers(users, `No signal for ${cronSetup.timeframe}`);
                return;
            }

            const message = formatSignalMessage(pricesWithSignal, cronSetup.timeframe);

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
    await storePairData(pairData, 'W1');
    await storePairData(pairData, 'D1');
    await storePairData(pairData, 'H4');
    await storePairData(pairData, 'H1');
    await storePairData(pairData, 'M30');
    await storePairData(pairData, 'M15');
})()

