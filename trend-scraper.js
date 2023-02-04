const axios = require("axios");
const cheerio = require("cheerio");

const trendFinderUrl = 'https://tradingrush.net/trendfinder/';

const scrapeTrend = async () => {
    let pairTrends = [];

    const html = (await axios.get(trendFinderUrl)).data;

    const $ = cheerio.load(html);

    const oneHourTrends = $('#trendfindermain .trend.1h');
    const fourHoursTrends = $('#trendfindermain .trend.4h');
    const dailyTrends = $('#trendfindermain .trend.1D');
    const weeklyTrends = $('#trendfindermain .trend.1W');

    $('#trendfindermain .trend.title').each((id, el) => {
        let pair = $(el).text();

        pairTrends.push({
            pair: pair,
            oneHour: $(oneHourTrends[id]).text(),
            fourHours: $(fourHoursTrends[id]).text(),
            daily: $(dailyTrends[id]).text(),
            weekly: $(weeklyTrends[id]).text(),
        })
    });

    return pairTrends;
}

module.exports = {
    scrapeTrend,
}