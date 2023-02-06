export const isPerfectBuySignal = ({close, ema200, macd, signal, histogram}) => {
    // Buy Rule
    // Price must close above EMA 200
    // Histogram must be positive
    // Macd line must be above signal line
    // both macd and signal must be negative

    let aboveEma200 = close > ema200;
    let positiveHistogram = histogram > 0;
    let macdHigherThanSignal = macd > signal;
    let negativeMacd = macd < 0;
    let negativeSignal = signal < 0;

    return aboveEma200 && positiveHistogram && macdHigherThanSignal && negativeMacd && negativeSignal;
}

export const isPerfectSellSignal = ({close, ema200, macd, signal, histogram}) => {
    // Sell Rule
    // Price must close below EMA 200
    // Histogram must be negative
    // Macd line must be below signal line
    // both macd and signal must be positive

    let belowEma200 = close < ema200;
    let negativeHistogram = histogram < 0;
    let macdLowerThanSignal = macd < signal;
    let positiveMacd = macd > 0;
    let positiveSignal = signal > 0;

    return belowEma200 && negativeHistogram && macdLowerThanSignal && positiveMacd && positiveSignal;
}

export const isWeakBuySignal = ({close, ema200, macd, signal, histogram}) => {
    // Buy Rule
    // Weak because MACD is already positive

    // Price must close above EMA 200
    // Histogram must be positive
    // Macd line must be above signal line
    // both macd and signal must be positive

    let aboveEma200 = close > ema200;
    let positiveHistogram = histogram > 0;
    let macdHigherThanSignal = macd > signal;
    let positiveMacd = macd > 0;
    let positiveSignal = signal > 0;

    return aboveEma200 && positiveHistogram && macdHigherThanSignal && positiveMacd && positiveSignal;
}

export const isWeakSellSignal = ({close, ema200, macd, signal, histogram}) => {
    // Sell Rule
    // Weak because MACD is already negative

    // Price must close below EMA 200
    // Histogram must be negative
    // Macd line must be below signal line
    // both macd and signal must be negative

    let belowEma200 = close < ema200;
    let negativeHistogram = histogram < 0;
    let macdLowerThanSignal = macd < signal;
    let negativeMacd = macd < 0;
    let negativeSignal = signal < 0;

    return belowEma200 && negativeHistogram && macdLowerThanSignal && negativeMacd && negativeSignal;
}

export const isDangerousBuySignal = ({close, ema200, macd, signal, histogram}) => {
    // Buy Rule
    // Dangerous because against the trend

    // Histogram must be positive
    // Macd line must be above signal line
    // both macd and signal must be negative

    let belowEma200 = close < ema200;
    let positiveHistogram = histogram > 0;
    let macdHigherThanSignal = macd > signal;
    let negativeMacd = macd < 0;
    let negativeSignal = signal < 0;

    return belowEma200 && positiveHistogram && macdHigherThanSignal && negativeMacd && negativeSignal;
}

export const isDangerousSellSignal = ({close, ema200, macd, signal, histogram}) => {
    // Sell Rule
    // Dangerous because against the trend

    // Price must close below EMA 200
    // Histogram must be negative
    // Macd line must be below signal line
    // both macd and signal must be positive

    let aboveEma200 = close > ema200;
    let negativeHistogram = histogram < 0;
    let macdLowerThanSignal = macd < signal;
    let positiveMacd = macd > 0;
    let positiveSignal = signal > 0;

    return aboveEma200 && negativeHistogram && macdLowerThanSignal && positiveMacd && positiveSignal;
}

export const isNoSignal = ({close, ema200, macd, signal, histogram}) => {
    return !isPerfectBuySignal({close, ema200, macd, signal, histogram})
        && !isPerfectSellSignal({close, ema200, macd, signal, histogram})
    // && !isWeakBuySignal({close, ema200, macd, signal, histogram})
    // && !isWeakSellSignal({close, ema200, macd, signal, histogram})
    // && !isDangerousBuySignal({close, ema200, macd, signal, histogram})
    // && !isDangerousSellSignal({close, ema200, macd, signal, histogram})
}

export const formatMessage = (prices, timeframe) => {
    let message = '';

    prices.forEach(price => {
        let payload = [];

        // break the price data to individual value to be passed to signal checkers
        switch (timeframe) {
            case "H1":
                payload = {close: price.h1_close, ema200: price.h1_ema200, macd: price.h1_macd, signal: price.h1_signal, histogram: price.h1_histogram};
                break;
            case "M30":
                payload = {close: price.m30_close, ema200: price.m30_ema200, macd: price.m30_macd, signal: price.m30_signal, histogram: price.m30_histogram};
                break;
            case "M15":
                payload = {close: price.m15_close, ema200: price.m15_ema200, macd: price.m15_macd, signal: price.m15_signal, histogram: price.m15_histogram};
                break;
            case "M5":
                payload = {close: price.m5_close, ema200: price.m5_ema200, macd: price.m5_macd, signal: price.m5_signal, histogram: price.m5_histogram};
                break;
        }

        if (isPerfectBuySignal(payload)) {
            message += `${price.pair} 📈 PERFECT BUY Signal ${timeframe} \n`;
            message += 'MACD Negative \n';
            message += 'Above EMA 200 \n';
        } else if (isPerfectSellSignal(payload)) {
            message += `${price.pair} 📉 PERFECT SELL Signal ${timeframe} \n`;
            message += 'MACD Positive \n';
            message += 'Below EMA 200 \n';
        }

            // else if (isWeakBuySignal(...payload)) {
            //     message += `${price.pair} 📈 Weak BUY Signal ${timeframe} \n`;
            //     message += 'MACD Positive \n';
            //     message += 'Above EMA 200 \n';
            // } else if (isWeakSellSignal(...payload)) {
            //     message += `${price.pair} 📉 Weak SELL Signal ${timeframe} \n`;
            //     message += 'MACD Negative \n';
            //     message += 'Below EMA 200 \n';
            // } else if (isDangerousBuySignal(...payload)) {
            //     message += `${price.pair} 📈 Danger BUY Signal in Downtrend ${timeframe} \n`;
            //     message += 'MACD Negative \n';
            //     message += 'Below EMA 200 \n';
            // } else if (isDangerousSellSignal(...payload)) {
            //     message += `${price.pair} 📉 Danger SELL Signal in Uptrend ${timeframe} \n`;
            //     message += 'MACD Positive \n';
            //     message += 'Above EMA 200 \n';
        // }

        else {
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