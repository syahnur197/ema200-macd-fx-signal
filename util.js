export const isBuySignal = (price) => {
    // Buy Rule
    // Price must close above EMA 200
    // Histogram must be positive
    // Macd line must be above signal line
    // both macd and signal must be negative

    let aboveEma200 = price.h1_close > price.h1_ema200;
    let positiveHistogram = price.histogram > 0;
    let macdHigherThanSignal = price.h1_macd > price.h1_signal;
    let negativeMacd = price.h1_macd < 0;
    let negativeSignal = price.h1_signal < 0;

    return aboveEma200 && positiveHistogram && macdHigherThanSignal && negativeMacd && negativeSignal;
}

export const isSellSignal = (price) => {
    // Sell Rule
    // Price must close below EMA 200
    // Histogram must be negative
    // Macd line must be below signal line
    // both macd and signal must be positive

    let belowEma200 = price.h1_close < price.h1_ema200;
    let negativeHistogram = price.histogram < 0;
    let macdLowerThanSignal = price.h1_macd < price.h1_signal;
    let positiveMacd = price.h1_macd > 0;
    let positiveSignal = price.h1_signal > 0;

    return belowEma200 && negativeHistogram && macdLowerThanSignal && positiveMacd && positiveSignal;
}

export const formatMessage = (prices) => {
    let message = '';

    prices.forEach(price => {
        if (isBuySignal(price)) {
            message += `${price.pair} BUY \n`;
        } else if (isSellSignal(price)) {
            message += `${price.pair} SELL \n`;
        } else {
            message += `${price.pair} No Trade \n`;
        }
        message += `1 hour: ${price.h1_close > price.h1_ema200 ? '🟢' : '🔴'} \n`;
        message += `4 hours: ${price.h4_close > price.h4_ema200 ? '🟢' : '🔴'} \n`;
        message += `1 daily: ${price.d1_close > price.d1_ema200 ? '🟢' : '🔴'} \n`;
        message += `1 weekly: ${price.w1_close > price.w1_ema200 ? '🟢' : '🔴'} \n`;

        message += "\n\n";
    })

    return message
}