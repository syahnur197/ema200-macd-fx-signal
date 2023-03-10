export const isBuySignal = (price) => {
  // Buy Rule
  // Price must close above EMA 200
  // Histogram must be positive
  // Macd line must be above signal line
  // both macd and signal must be negative

  let aboveEma200 = price.close > price.ema200;
  let positiveHistogram = price.macd_histogram >= 0;
  let macdHigherThanSignal = price.macd > price.macd_signal;
  let negativeMacd = price.macd <= 0;
  let negativeSignal = price.macd_signal <= 0;

  return (
    aboveEma200 &&
    positiveHistogram &&
    macdHigherThanSignal &&
    negativeMacd &&
    negativeSignal
  );
};

export const isSellSignal = (price) => {
  // Sell Rule
  // Price must close below EMA 200
  // Histogram must be negative
  // Macd line must be below signal line
  // both macd and signal must be positive

  let belowEma200 = price.close < price.ema200;
  let negativeHistogram = price.macd_histogram <= 0;
  let macdLowerThanSignal = price.macd < price.macd_signal;
  let positiveMacd = price.macd >= 0;
  let positiveSignal = price.macd_signal >= 0;

  return (
    belowEma200 &&
    negativeHistogram &&
    macdLowerThanSignal &&
    positiveMacd &&
    positiveSignal
  );
};

export const isNoSignal = (price) => {
  return !isBuySignal(price) && !isSellSignal(price);
};

export const formatSignalMessage = (prices, timeframe) => {
  let message = "";

  prices.forEach((price) => {
    if (isBuySignal(price[timeframe])) {
      message += `${price[timeframe].pair} 📈 BUY Signal ${timeframe} \n`;
      message += "MACD Negative \n";
      message += "Above EMA 200 \n";
    } else if (isSellSignal(price[timeframe])) {
      message += `${price[timeframe].pair} 📉 SELL Signal ${timeframe} \n`;
      message += "MACD Positive \n";
      message += "Below EMA 200 \n";
    } else {
      message += `${price[timeframe].pair} No Trade ${timeframe} \n`;
    }

    message += `1 weekly: ${
      price["W1"].close > price["W1"].ema200 ? "🟢" : "🔴"
    } \n`;
    message += `1 daily: ${
      price["D1"].close > price["D1"].ema200 ? "🟢" : "🔴"
    } \n`;
    message += `4 hours: ${
      price["H4"].close > price["H4"].ema200 ? "🟢" : "🔴"
    } \n`;
    message += `1 hour: ${
      price["H1"].close > price["H1"].ema200 ? "🟢" : "🔴"
    } \n`;

    message += "\n\n";
  });

  return message;
};
