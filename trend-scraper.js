const axios = require("axios");
const cheerio = require("cheerio");

const trendFinderUrl = 'https://tradingrush.net/trendfinder/';

const scrapeTrend = async () => {
    let pairs = [];
    let pairTrends = [];

    const html = (await axios.get(trendFinderUrl)).data;

    const $ = cheerio.load(html);

    const oneHourTrends = $('#trendfindermain .trend.1h');
    const fourHoursTrends = $('#trendfindermain .trend.4h');
    const dailyTrends = $('#trendfindermain .trend.1D');
    const weeklyTrends = $('#trendfindermain .trend.1W');

    $('#trendfindermain .trend.title').each((id, el) => {
        let pair = $(el).text();

        // only push if 1h, 4h, and 1D equal
        if (
            $(oneHourTrends[id]).text() === $(fourHoursTrends[id]).text() &&
            $(fourHoursTrends[id]).text() === $(dailyTrends[id]).text()
        ) {
            pairTrends.push({
                pair: pair,
                oneHour: $(oneHourTrends[id]).text() === 'uptrend' ? '🟢' : '🔴',
                fourHours: $(fourHoursTrends[id]).text() === 'uptrend' ? '🟢' : '🔴',
                daily: $(dailyTrends[id]).text() === 'uptrend' ? '🟢' : '🔴',
                weekly: $(weeklyTrends[id]).text() === 'uptrend' ? '🟢' : '🔴',
            })
        }

    });

    return pairTrends;
}

module.exports = {
    scrapeTrend,
}