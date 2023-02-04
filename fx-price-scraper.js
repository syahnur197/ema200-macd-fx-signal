const axios = require("axios");

const endpoint = 'https://api.bitapi.pro/v1/technical/indicator';
const exchange = 'OANDA';
const interval = '1h';
const ema = 'EMA:200';
const macd = 'MACD:12,26,close,9';
const ma = 'MA:1';

const scrapeFxPrice = async (pairTrend) => {
    let pair = pairTrend.pair;

    let url = `${endpoint}?exchange=${exchange}&symbol=${pair}&interval=${interval}&id=${ema}&id=${macd}&id=${ma}`;

    let response = {}

    try {
        response = (await axios.get(url)).data;
    } catch (e) {
        return {};
    }

    let closedPrice = 0;
    let emaPrice = 0;
    let histogram = 0;
    let macdLine = 0;
    let signalLine = 0;

    for (let j = 0; j < response.length; j++) {
        if (response[j].id === 'MA') {
            closedPrice = response[j].data[0];
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

    return {
        ...pairTrend,
        closedPrice,
        emaPrice,
        histogram,
        macdLine,
        signalLine,
    }
}

module.exports = {
    scrapeFxPrice,
}