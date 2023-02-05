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
            "MACD.macd|60",
            "MACD.signal|60",
            "MACD.hist|60",
            "close|60",
            "EMA200|60",
            "close|240",
            "EMA200|240",
            "close",
            "EMA200",
            "close|1W",
            "EMA200|1W"
        ],
    })).data;

    for (let i = 0; i < responseData.data.length; i++) {
        priceData.push({
            pair: responseData.data[i]["s"].substring(7),
            h1_macd: responseData.data[i]["d"][0],
            h1_signal: responseData.data[i]["d"][1],
            h1_histogram: responseData.data[i]["d"][2],
            h1_close: responseData.data[i]["d"][3],
            h1_ema200: responseData.data[i]["d"][4],
            h4_close: responseData.data[i]["d"][5],
            h4_ema200: responseData.data[i]["d"][6],
            d1_close: responseData.data[i]["d"][7],
            d1_ema200: responseData.data[i]["d"][8],
            w1_close: responseData.data[i]["d"][9],
            w1_ema200: responseData.data[i]["d"][10],
        })
    }

    return priceData;
}
