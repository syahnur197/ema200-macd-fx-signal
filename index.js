require('dotenv').config()
const axios = require("axios");
const TelegramBot = require('node-telegram-bot-api');
const CronJob = require('cron').CronJob;

const endpoint = 'https://api.bitapi.pro/v1/technical/indicator';
const exchange = 'OANDA';
const pairs = ['EURUSD', 'GBPUSD', 'AUDUSD', 'USDCHF', 'USDJPY', 'NZDUSD'];
const interval = '1h';
const ema = 'EMA:200';
const macd = 'MACD:12,26,close,9';
const ma = 'MA:1';

const telegramBotToken = process.env.BOT_TOKEN; // Telegram bot

let userIds = [];

const bot = new TelegramBot(telegramBotToken, {polling: true});

// Matches "/start"
bot.onText(/\/start/, (msg, match) => {
  let fromId = msg.from.id;
  let name = msg.from.first_name;

  userIds.push(fromId);

  console.log(userIds);

  // send back the matched "whatever" to the chat
  bot.sendMessage(fromId, `Welcome ${name}, thank you for registering for the signal`);
});

const checkSignal = async () => {
    console.log("running....")
    let message = '';
    for (let i = 0; i < pairs.length; i++) {
        let pair = pairs[i];

        let url = `${endpoint}?exchange=${exchange}&symbol=${pair}&interval=${interval}&id=${ema}&id=${macd}&id=${ma}`;

        console.log(url);

        const response = (await axios.get(url)).data;

        let currentPrice = 0;
        let emaPrice = 0;
        let histogram = 0;
        let macdLine = 0;
        let signalLine = 0;

        for (let  j = 0; j < response.length; j++) {
            if (response[j].id === 'MA') {
                currentPrice = response[j].data[0];
            }
            if (response[j].id === 'EMA') {
                emaPrice = response[j].data[0];
            }
            if (response[j].id === 'MACD') {
                histogram = response[j].data[0];
                macdLine = response[j].data[1];
                signalLine = response[j].data[2];
            }
        }

        let buyConditionA = currentPrice > emaPrice;
        let buyConditionB = histogram > 0;
        let buyConditionC = macdLine > signalLine;
        let buyConditionD = macdLine < 0;
        let buyConditionE = signalLine < 0;

        let sellConditionA = currentPrice < emaPrice;
        let sellConditionB = histogram < 0;
        let sellConditionC = macdLine < signalLine;
        let sellConditionD = macdLine > 0;
        let sellConditionE = signalLine > 0;

        if (buyConditionA && buyConditionB && buyConditionC && buyConditionD && buyConditionC && buyConditionE) {
            message += `${pair} Buy \n`;
        } else if (sellConditionA && sellConditionB && sellConditionC && sellConditionD && sellConditionC && sellConditionE) {
            message += `${pair} Sell \n`;
        } else {
            message += `${pair} No trade \n`;
        }
    }

    for (let i = 0; i < userIds.length; i++) {
        await bot.sendMessage(userIds[i], message);
    }
}

new CronJob(
	'0 * * * * *',
	function() {
		checkSignal()
	},
	null,
	true,
	'Asia/Brunei'
);
