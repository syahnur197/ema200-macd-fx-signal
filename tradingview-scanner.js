import axios from "axios";

export const scanTradingView = async (pairs) => {
  let tickers = [];
  let priceData = [];

  for (let i = 0; i < pairs.length; i++) {
    tickers.push(`FX_IDC:${pairs[i]}`);
  }

  const responseData = (
    await axios.post("https://scanner.tradingview.com/forex/scan", {
      symbols: {
        tickers: tickers,
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

        "MACD.macd|1W",
        "MACD.signal|1W",
        "MACD.hist|1W",
        "close|1W",
        "EMA200|1W",
      ],
    })
  ).data;

  for (let i = 0; i < responseData.data.length; i++) {
    priceData.push({
      pair: responseData.data[i]["s"].substring(7),
      timeframe: {
        M5: {
          macd: responseData.data[i]["d"][0],
          signal: responseData.data[i]["d"][1],
          histogram: responseData.data[i]["d"][2],
          close: responseData.data[i]["d"][3],
          ema200: responseData.data[i]["d"][4],
        },
        M15: {
          macd: responseData.data[i]["d"][5],
          signal: responseData.data[i]["d"][6],
          histogram: responseData.data[i]["d"][7],
          close: responseData.data[i]["d"][8],
          ema200: responseData.data[i]["d"][9],
        },
        M30: {
          macd: responseData.data[i]["d"][10],
          signal: responseData.data[i]["d"][11],
          histogram: responseData.data[i]["d"][12],
          close: responseData.data[i]["d"][13],
          ema200: responseData.data[i]["d"][14],
        },
        H1: {
          macd: responseData.data[i]["d"][15],
          signal: responseData.data[i]["d"][16],
          histogram: responseData.data[i]["d"][17],
          close: responseData.data[i]["d"][18],
          ema200: responseData.data[i]["d"][19],
        },
        H4: {
          macd: responseData.data[i]["d"][20],
          signal: responseData.data[i]["d"][21],
          histogram: responseData.data[i]["d"][22],
          close: responseData.data[i]["d"][23],
          ema200: responseData.data[i]["d"][24],
        },
        D1: {
          macd: responseData.data[i]["d"][25],
          signal: responseData.data[i]["d"][26],
          histogram: responseData.data[i]["d"][27],
          close: responseData.data[i]["d"][28],
          ema200: responseData.data[i]["d"][29],
        },
        W1: {
          macd: responseData.data[i]["d"][30],
          signal: responseData.data[i]["d"][31],
          histogram: responseData.data[i]["d"][32],
          close: responseData.data[i]["d"][33],
          ema200: responseData.data[i]["d"][34],
        },
      },
    });
  }

  return priceData;
};
