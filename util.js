export const isPerfectBuySignal = (price) => {
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

export const isPerfectSellSignal = (price) => {
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

export const isWeakBuySignal = (price) => {
    // Buy Rule
    // Weak because MACD is already positive

    // Price must close above EMA 200
    // Histogram must be positive
    // Macd line must be above signal line
    // both macd and signal must be positive

    let aboveEma200 = price.h1_close > price.h1_ema200;
    let positiveHistogram = price.histogram > 0;
    let macdHigherThanSignal = price.h1_macd > price.h1_signal;
    let positiveMacd = price.h1_macd > 0;
    let positiveSignal = price.h1_signal > 0;

    return aboveEma200 && positiveHistogram && macdHigherThanSignal && positiveMacd && positiveSignal;
}

export const isWeakSellSignal = (price) => {
    // Sell Rule
    // Weak because MACD is already negative

    // Price must close below EMA 200
    // Histogram must be negative
    // Macd line must be below signal line
    // both macd and signal must be negative

    let belowEma200 = price.h1_close < price.h1_ema200;
    let negativeHistogram = price.histogram < 0;
    let macdLowerThanSignal = price.h1_macd < price.h1_signal;
    let negativeMacd = price.h1_macd < 0;
    let negativeSignal = price.h1_signal < 0;

    return belowEma200 && negativeHistogram && macdLowerThanSignal && negativeMacd && negativeSignal;
}

export const isDangerousBuySignal = (price) => {
    // Buy Rule
    // Dangerous because against the trend

    // Histogram must be positive
    // Macd line must be above signal line
    // both macd and signal must be negative

    let belowEma200 = price.h1_close < price.h1_ema200;
    let positiveHistogram = price.histogram > 0;
    let macdHigherThanSignal = price.h1_macd > price.h1_signal;
    let negativeMacd = price.h1_macd < 0;
    let negativeSignal = price.h1_signal < 0;

    return belowEma200 && positiveHistogram && macdHigherThanSignal && negativeMacd && negativeSignal;
}

export const isDangerousSellSignal = (price) => {
    // Sell Rule
    // Dangerous because against the trend

    // Price must close below EMA 200
    // Histogram must be negative
    // Macd line must be below signal line
    // both macd and signal must be positive

    let aboveEma200 = price.h1_close > price.h1_ema200;
    let negativeHistogram = price.histogram < 0;
    let macdLowerThanSignal = price.h1_macd < price.h1_signal;
    let positiveMacd = price.h1_macd > 0;
    let positiveSignal = price.h1_signal > 0;

    return aboveEma200 && negativeHistogram && macdLowerThanSignal && positiveMacd && positiveSignal;
}

export const isNoSignal = (price) => {
    return !isPerfectBuySignal(price) && !isPerfectSellSignal(price)
        && !isWeakBuySignal(price) && !isWeakSellSignal(price)
        && !isDangerousBuySignal(price) && !isDangerousSellSignal(price)
}

export const formatMessage = (prices) => {
    let message = '';

    prices.forEach(price => {
        if (isPerfectBuySignal(price)) {
            message += `${price.pair} 📈 PERFECT BUY Signal \n`;
            message += 'MACD Negative \v';
            message += 'Above EMA 200 \v';
        } else if (isPerfectSellSignal(price)) {
            message += `${price.pair} 📉 PERFECT SELL Signal \n`;
            message += 'MACD Positive \v';
            message += 'Below EMA 200 \v';
        } else if (isWeakBuySignal(price)) {
            message += `${price.pair} 📈 Weak BUY Signal \n`;
            message += 'MACD Positive \v';
            message += 'Above EMA 200 \v';
        } else if (isWeakSellSignal(price)) {
            message += `${price.pair} 📉 Weak SELL Signal \n`;
            message += 'MACD Negative \v';
            message += 'Below EMA 200 \v';
        } else if (isDangerousBuySignal(price)) {
            message += `${price.pair} 📈 Danger BUY Signal in Downtrend \n`;
            message += 'MACD Negative \v';
            message += 'Below EMA 200 \v';
        } else if (isDangerousSellSignal(price)) {
            message += `${price.pair} 📉 Danger SELL Signal in Uptrend \n`;
            message += 'MACD Positive \v';
            message += 'Above EMA 200 \v';
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