require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const CronJob = require('cron').CronJob;

const {scrapeTrend} = require("./trend-scraper");
const {scrapeFxPrice} = require("./fx-price-scraper");
const {checkSignal, BUY, SELL} = require("./signal-checker");
const {PrismaClient} = require("@prisma/client");

const prisma = new PrismaClient()

const telegramBotToken = process.env.BOT_TOKEN; // Telegram bot
const cronExpression = process.env.CRON_EXPRESSION

const bot = new TelegramBot(telegramBotToken, {polling: true});

// Matches "/start"
bot.onText(/\/start/, async (msg, match) => {
    let fromId = msg.from.id;
    let name = msg.from.first_name;

    const user = prisma.user.findFirst({
        where: {telegramId: fromId}
    });

    if (user) {
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

bot.onText(/\/signal/, async (msg, match) => {
    let fromId = msg.from.id;

    await bot.sendMessage(fromId, `Fetching signal`);

    await requestSignal(fromId);
});

bot.onText(/\/quit/, async (msg, match) => {
    let fromId = msg.from.id;
    let name = msg.from.first_name;

    const user = prisma.user.findFirst({
        where: {telegramId: fromId}
    });

    if (!user) {
        await bot.sendMessage(fromId, `${name}, you already quit the signal group!`);
        return;
    }

    await prisma.user.delete({
        where: {telegramId: fromId},
    })

    // send back the matched "whatever" to the chat
    await bot.sendMessage(fromId, `We're sad to see you leave this signal group ${name}, see you in the future!`);
});

const formatMessage = (pairIndicatorDatum) => {
    let message = '';
    message += `1 hour: ${pairIndicatorDatum.h1_trend === 'uptrend' ? '🟢' : '🔴'} \n`;
    message += `4 hours: ${pairIndicatorDatum.h4_trend === 'uptrend' ? '🟢' : '🔴'} \n`;
    message += `1 daily: ${pairIndicatorDatum.d1_trend === 'uptrend' ? '🟢' : '🔴'} \n`;
    message += `1 weekly: ${pairIndicatorDatum.w1_trend === 'uptrend' ? '🟢' : '🔴'} \n`;

    if (pairIndicatorDatum.signal === BUY) {
        message = `${pairIndicatorDatum.pair} Buy \n` + message
    } else if (pairIndicatorDatum.signal === SELL) {
        message = `${pairIndicatorDatum.pair} Sell \n` + message
    } else {
        message = `${pairIndicatorDatum.pair} No Trade \n` + message
    }

    return message
}

const sendMessage = async (users, message) => {
    for (let i = 0; i < users.length; i++) {
        await bot.sendMessage(users[i].telegramId, message);
    }
}

const requestSignal = async (telegramId) => {
    const prices = await prisma.$queryRaw`SELECT * FROM Price WHERE id IN (SELECT MAX(id) FROM Price GROUP BY pair)`;

    for (let i = 0; i < prices.length; i++) {
        const pairSignal = await checkSignal(prices[i], prices[i]);

        const message = formatMessage(pairSignal)

        await bot.sendMessage(telegramId, message)
    }
}

const main = async () => {
    console.log('fetching trend from trading rush')
    const pairTrends = await scrapeTrend();

    console.log('fetching all users')
    const users = await prisma.user.findMany();

    console.log('fetching pair ema and macd data')
    for (let i = 0; i < pairTrends.length; i++) {
        const pairIndicatorDatum = await scrapeFxPrice(pairTrends[i])

        if (!pairIndicatorDatum) {
            continue;
        }

        await prisma.price.create({
            data: {
                pair: pairIndicatorDatum.pair,
                closed_price: pairIndicatorDatum.closedPrice,
                ema_price: pairIndicatorDatum.emaPrice,
                histogram: pairIndicatorDatum.histogram,
                macd_line: pairIndicatorDatum.macdLine,
                signal_line: pairIndicatorDatum.signalLine,
                h1_trend: pairIndicatorDatum.oneHour,
                h4_trend: pairIndicatorDatum.fourHours,
                d1_trend: pairIndicatorDatum.daily,
                w1_trend: pairIndicatorDatum.weekly,
            }
        })

        // get the latest two pair data
        const prices = await prisma.price.findMany({
            orderBy: [
                {
                    created_at: 'desc',
                },
            ],
            take: 2,
            where: {
                pair: {
                    equals: pairTrends[i].pair,
                }
            }
        });

        if (prices.length < 2) {
            continue;
        }

        const pairSignal = await checkSignal(prices[0], prices[1]);

        const message = formatMessage(pairSignal)

        await sendMessage(users, message)
    }
}

new CronJob(
    cronExpression,
    async function () {
        await main()
    },
    null,
    false,
    'Asia/Brunei'
);

if (process.env.ENVIRONMENT === 'development') {
    requestSignal();
    main();
}

