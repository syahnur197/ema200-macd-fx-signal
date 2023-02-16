import { isNoSignal, isBuySignal, isSellSignal } from "./util.js";

test("price is buy signal", () => {
  expect(
    isBuySignal({
      close: 1,
      ema200: 0,
      macd: -1,
      macd_signal: -2,
      macd_histogram: 1,
    })
  ).toBe(true);
});

test("price is sell signal", () => {
  expect(
    isSellSignal({
      close: -1,
      ema200: 0,
      macd: 1,
      macd_signal: 2,
      macd_histogram: -1,
    })
  ).toBe(true);
});

test("price has no signal", () => {
  expect(
    isNoSignal({
      close: -1,
      ema200: 0,
      macd: 1,
      macd_signal: 2,
      macd_histogram: 1,
    })
  ).toBe(true);
});
