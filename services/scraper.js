const { launchPuppeteer } = require('../config/puppeteer');
const { convertToSpeech } = require('../services/tts')
const { paraphraseText } = require('../services/paraphaser')

let financeNews = [];
let selfPushedNewsData = [];

async function scrapeKantipurFinanceNews() {
    console.log('Scraping Finance News Data...');
    const browser = await launchPuppeteer();
    try {
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36');

        await page.goto('https://ekantipur.com/business', {
            waitUntil: 'networkidle2',
            timeout: 0,
        });

        await page.waitForSelector('.normal');

        const financeNewsData = await page.evaluate(() => {
            const articleUrls = [];
            const uniqueIds = new Set();
            document.querySelectorAll('.normal').forEach((element) => {
                const newsCard = element;
                const title = newsCard.querySelector('.teaser h2 a')?.textContent?.trim();
                const link = newsCard.querySelector('.teaser h2 a')?.getAttribute('href');
                const fullLink = link ? [`https://ekantipur.com${link}`] : [];

                const imageElement = newsCard.querySelector('.image figure a img');
                let imageUrl = imageElement?.getAttribute('src') || imageElement?.getAttribute('data-src') || '';

                const content = newsCard.querySelector('.teaser p')?.textContent?.trim();
                const sourceImages = ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRupQwELqDYhcmL8weYk7SrxlqoDbVZX9OhJA&s'];

                const id = [...Array(20)].map(() => Math.random().toString(36)[2]).join('');

                if (!uniqueIds.has(id)) {
                    uniqueIds.add(id);
                    articleUrls.push({
                        title,
                        content,
                        link: fullLink,
                        sourceImageUrl: sourceImages,
                        id,
                        imageUrl,
                    });
                }
            });
            return articleUrls;
        });

        // const currentTitles = financeNewsData.map(article => article.title);
        // cleanUpCache(currentTitles);

        const finalfinanceNewsData = [];

        for (let article of financeNewsData) {
            const { title, content, link, imageUrl, id, sourceImageUrl } = article;

            try {
                const titleAudio = await convertToSpeech(title);
                const contentAudio = await convertToSpeech(content);
                // const titleAudio = '';
                // const contentAudio = '';

                finalfinanceNewsData.push({
                    title,
                    titleAudio: titleAudio || null,
                    sourceImageUrl,
                    imageUrl,
                    id,
                    urls: link,
                    date: 'N/A',
                    content: content,
                    contentAudio: contentAudio || null
                });
            } catch (error) {
                console.error(`Error processing article: ${link}`);
            }
        }

        financeNews = [...finalfinanceNewsData];
        // console.log(financeNews)
        console.log('All finanace news data scraped successfully');
    } catch (error) {
        console.error('Error scraping Kantipur Finanace News.', error);
    } finally {
        if (browser) {
            await browser.close(); // Ensure the browser is closed to avoid memory leaks
        }
    }
}

module.exports = {
    scrapeKantipurFinanceNews,
    getFinanceNewsData: () => financeNews,
    selfPushedNewsData,
};