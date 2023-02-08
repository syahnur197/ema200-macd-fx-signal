import axios from "axios";

export const scanTradingView = async (pairs) => {
    let tickers = [];
    let priceData = [];

    for (let i = 0; i < pairs.length; i++) {
        tickers.push(`FX_IDC:${pairs[i]}`);
    }

    const responseData = (await axios.post('https://scanner.tradingview.com/forex/scan', {
        symbols: {
            tickers: tickers
        },
        query: {
            types: [],
        },
        columns: [
            "MACD.macd|5",
            "MACD.signal|5",
            "MACD.hist|5",
            "close|5",
            "EMA200|5",

            "MACD.macd|15",
            "MACD.signal|15",
            "MACD.hist|15",
            "close|15",
            "EMA200|15",

            "MACD.macd|30",
            "MACD.signal|30",
            "MACD.hist|30",
            "close|30",
            "EMA200|30",

            "MACD.macd|60",
            "MACD.signal|60",
            "MACD.hist|60",
            "close|60",
            "EMA200|60",

            "MACD.macd|240",
            "MACD.signal|240",
            "MACD.hist|240",
            "close|240",
            "EMA200|240",

            "MACD.macd",
            "MACD.signal",
            "MACD.hist",
            "close",
            "EMA200",

            "close|1W",
            "EMA200|1W"
        ],
    })).data;

    for (let i = 0; i < responseData.data.length; i++) {
        priceData.push({
            pair: responseData.data[i]["s"].substring(7),
            m5_macd: responseData.data[i]["d"][0],
            m5_signal: responseData.data[i]["d"][1],
            m5_histogram: responseData.data[i]["d"][2],
            m5_close: responseData.data[i]["d"][3],
            m5_ema200: responseData.data[i]["d"][4],

            m15_macd: responseData.data[i]["d"][5],
            m15_signal: responseData.data[i]["d"][6],
            m15_histogram: responseData.data[i]["d"][7],
            m15_close: responseData.data[i]["d"][8],
            m15_ema200: responseData.data[i]["d"][9],

            m30_macd: responseData.data[i]["d"][10],
            m30_signal: responseData.data[i]["d"][11],
            m30_histogram: responseData.data[i]["d"][12],
            m30_close: responseData.data[i]["d"][13],
            m30_ema200: responseData.data[i]["d"][14],

            h1_macd: responseData.data[i]["d"][15],
            h1_signal: responseData.data[i]["d"][16],
            h1_histogram: responseData.data[i]["d"][17],
            h1_close: responseData.data[i]["d"][18],
            h1_ema200: responseData.data[i]["d"][19],


            h4_macd: responseData.data[i]["d"][20],
            h4_signal: responseData.data[i]["d"][21],
            h4_histogram: responseData.data[i]["d"][22],
            h4_close: responseData.data[i]["d"][23],
            h4_ema200: responseData.data[i]["d"][24],

            d1_macd: responseData.data[i]["d"][25],
            d1_signal: responseData.data[i]["d"][26],
            d1_histogram: responseData.data[i]["d"][27],
            d1_close: responseData.data[i]["d"][28],
            d1_ema200: responseData.data[i]["d"][29],

            w1_close: responseData.data[i]["d"][30],
            w1_ema200: responseData.data[i]["d"][31],
        })
    }

    return priceData;
}
