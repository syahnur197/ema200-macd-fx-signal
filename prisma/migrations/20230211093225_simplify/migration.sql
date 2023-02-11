/*
  Warnings:

  - You are about to drop the column `d1_close` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `d1_ema200` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `d1_histogram` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `d1_macd` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `d1_signal` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `h1_close` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `h1_ema200` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `h1_histogram` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `h1_macd` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `h1_signal` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `h4_close` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `h4_ema200` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `h4_histogram` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `h4_macd` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `h4_signal` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m15_close` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m15_ema200` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m15_histogram` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m15_macd` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m15_signal` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m30_close` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m30_ema200` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m30_histogram` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m30_macd` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m30_signal` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m5_close` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m5_ema200` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m5_histogram` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m5_macd` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `m5_signal` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `w1_close` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `w1_ema200` on the `Price` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Price` DROP COLUMN `d1_close`,
    DROP COLUMN `d1_ema200`,
    DROP COLUMN `d1_histogram`,
    DROP COLUMN `d1_macd`,
    DROP COLUMN `d1_signal`,
    DROP COLUMN `h1_close`,
    DROP COLUMN `h1_ema200`,
    DROP COLUMN `h1_histogram`,
    DROP COLUMN `h1_macd`,
    DROP COLUMN `h1_signal`,
    DROP COLUMN `h4_close`,
    DROP COLUMN `h4_ema200`,
    DROP COLUMN `h4_histogram`,
    DROP COLUMN `h4_macd`,
    DROP COLUMN `h4_signal`,
    DROP COLUMN `m15_close`,
    DROP COLUMN `m15_ema200`,
    DROP COLUMN `m15_histogram`,
    DROP COLUMN `m15_macd`,
    DROP COLUMN `m15_signal`,
    DROP COLUMN `m30_close`,
    DROP COLUMN `m30_ema200`,
    DROP COLUMN `m30_histogram`,
    DROP COLUMN `m30_macd`,
    DROP COLUMN `m30_signal`,
    DROP COLUMN `m5_close`,
    DROP COLUMN `m5_ema200`,
    DROP COLUMN `m5_histogram`,
    DROP COLUMN `m5_macd`,
    DROP COLUMN `m5_signal`,
    DROP COLUMN `w1_close`,
    DROP COLUMN `w1_ema200`,
    ADD COLUMN `close` DECIMAL(10, 5) NOT NULL DEFAULT 0,
    ADD COLUMN `ema200` DECIMAL(10, 5) NOT NULL DEFAULT 0,
    ADD COLUMN `histogram` DECIMAL(11, 8) NOT NULL DEFAULT 0,
    ADD COLUMN `macd` DECIMAL(11, 8) NOT NULL DEFAULT 0,
    ADD COLUMN `signal` DECIMAL(11, 8) NOT NULL DEFAULT 0;
