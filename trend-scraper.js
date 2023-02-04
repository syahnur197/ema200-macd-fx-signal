const axios = require("axios");
const cheerio = require("cheerio");

const trendFinderUrl = 'https://tradingrush.net/trendfinder/';

const scrapeTrend = async () => {
    let pairs = [];
    let pairTrends = [];

    const html = (await axios.get(trendFinderUrl)).data;

    const $ = cheerio.load(html);

    const thirtyMinTrends = $('#trendfindermain .trend.30min');
    const oneHourTrends = $('#trendfindermain .trend.1h');
    const twoHoursTrends = $('#trendfindermain .trend.2h');
    const fourHoursTrends = $('#trendfindermain .trend.4h');
    const dailyTrends = $('#trendfindermain .trend.1D');
    const weeklyTrends = $('#trendfindermain .trend.1W');

    $('#trendfindermain .trend.title').each((id, el) => {
        let pair = $(el).text();
        pairTrends.push({
            pair: pair,
            thirtyMin: $(thirtyMinTrends[id]).text() === 'uptrend' ? '🟢' : '🔴',
            oneHour: $(oneHourTrends[id]).text() === 'uptrend' ? '🟢' : '🔴',
            twoHours: $(twoHoursTrends[id]).text() === 'uptrend' ? '🟢' : '🔴',
            fourHours: $(fourHoursTrends[id]).text() === 'uptrend' ? '🟢' : '🔴',
            daily: $(dailyTrends[id]).text() === 'uptrend' ? '🟢' : '🔴',
            weekly: $(weeklyTrends[id]).text() === 'uptrend' ? '🟢' : '🔴',
        })
    });

    return pairTrends;
}

module.exports = {
    scrapeTrend,
}