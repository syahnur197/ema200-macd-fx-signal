-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `telegramId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_telegramId_key`(`telegramId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Price` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pair` VARCHAR(191) NOT NULL,
    `closed_price` DECIMAL(65, 30) NOT NULL,
    `ema_price` DECIMAL(65, 30) NOT NULL,
    `histogram` DECIMAL(65, 30) NOT NULL,
    `macd_line` DECIMAL(65, 30) NOT NULL,
    `signal_line` DECIMAL(65, 30) NOT NULL,
    `h1_trend` VARCHAR(191) NOT NULL,
    `h4_trend` VARCHAR(191) NOT NULL,
    `d1_trend` VARCHAR(191) NOT NULL,
    `w1_trend` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
