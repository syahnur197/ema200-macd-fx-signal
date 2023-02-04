/*
  Warnings:

  - You are about to alter the column `closed_price` on the `Price` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,5)`.
  - You are about to alter the column `ema_price` on the `Price` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,5)`.
  - You are about to alter the column `histogram` on the `Price` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,5)`.
  - You are about to alter the column `macd_line` on the `Price` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,5)`.
  - You are about to alter the column `signal_line` on the `Price` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,5)`.

*/
-- AlterTable
ALTER TABLE `Price` MODIFY `closed_price` DECIMAL(10, 5) NOT NULL,
    MODIFY `ema_price` DECIMAL(10, 5) NOT NULL,
    MODIFY `histogram` DECIMAL(10, 5) NOT NULL,
    MODIFY `macd_line` DECIMAL(10, 5) NOT NULL,
    MODIFY `signal_line` DECIMAL(10, 5) NOT NULL;
