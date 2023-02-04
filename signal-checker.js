const BUY = 'buy'
const SELL = 'sell'

const checkSignal = async (newPrice, oldPrice) => {
    let buyConditionA = newPrice.closed_price > newPrice.ema_price;
    let buyConditionB = newPrice.histogram > 0;
    let buyConditionC = newPrice.macd_line > newPrice.signal_line;
    let buyConditionD = newPrice.macd_line < 0;
    let buyConditionE = newPrice.signal_line < 0;
    let buyConditionF = oldPrice.histogram < 0;

    let sellConditionA = newPrice.closed_price < newPrice.ema_price;
    let sellConditionB = newPrice.histogram < 0;
    let sellConditionC = newPrice.macd_line < newPrice.signal_line;
    let sellConditionD = newPrice.macd_line > 0;
    let sellConditionE = newPrice.signal_line > 0;
    let sellConditionF = oldPrice.histogram > 0;

    newPrice['signal'] = '';

    if (buyConditionA && buyConditionB && buyConditionC && buyConditionD && buyConditionC && buyConditionE) {
        newPrice['signal'] = BUY;
    } else if (sellConditionA && sellConditionB && sellConditionC && sellConditionD && sellConditionC && sellConditionE) {
        newPrice['signal'] = SELL;
    }

    return newPrice;
}

module.exports = {
    checkSignal,
    BUY,
    SELL,
}