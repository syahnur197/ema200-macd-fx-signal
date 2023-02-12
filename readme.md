# MACD Signal Bot

This script will alert you via telegram bot if there is a buy/sell signal in the FX pairs returned by TradingView Scanner.

## Requirements

- npm
- node js
- Telegram bot api token

## Telegram Bot Api Token

You can get it from Telegram's Botfather

## Installation

- clone this repo
- run npm install
- $ cp .env.example .env
- fill in the BOT_TOKEN
- $ node index.js
- send `/start` to your Telegram bot, and it will alert you for trade signal every minute.

## Conditions

These are the conditions when the Bot will alert you

### Buy

- Price above EMA200
- MACD Line > Signal Line
- MACD Line & Signal Line below 0

### Sell

- Price below EMA200
- MACD Line < Signal Line
- MACD Line & Signal Line above 0

## Trend Finder

- The bot also tells you the market trend using EMA 200
