-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `telegramId` INTEGER NOT NULL,

    UNIQUE INDEX `User_telegramId_key`(`telegramId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Price` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pair` VARCHAR(191) NOT NULL,
    `h1_macd` DECIMAL(11, 8) NOT NULL,
    `h1_signal` DECIMAL(11, 8) NOT NULL,
    `h1_histogram` DECIMAL(11, 8) NOT NULL,
    `h1_close` DECIMAL(10, 5) NOT NULL,
    `h1_ema200` DECIMAL(10, 5) NOT NULL,
    `h4_close` DECIMAL(10, 5) NOT NULL,
    `h4_ema200` DECIMAL(10, 5) NOT NULL,
    `d1_close` DECIMAL(10, 5) NOT NULL,
    `d1_ema200` DECIMAL(10, 5) NOT NULL,
    `w1_close` DECIMAL(10, 5) NOT NULL,
    `w1_ema200` DECIMAL(10, 5) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Price_pair_created_at_key`(`pair`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;