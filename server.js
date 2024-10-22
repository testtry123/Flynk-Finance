const express = require('express');
const cors = require('cors');
const compression = require('compression');
const bodyParser = require('body-parser');
const cron = require('node-cron');
const { scrapeKantipurFinanceNews } = require('./services/scraper');

const financeRoutes = require('./routes/financeNews')
const ttsRoutes = require('./routes/ttsRoutes');
const paraphraseRoutes = require('./routes/paraphaser');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;


app.use(compression());
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

app.use('/api/finance', financeRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/paraphrase', paraphraseRoutes);

app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

scrapeKantipurFinanceNews();

cron.schedule('*/59 * * * *', async () => {
    try {
        scrapeKantipurFinanceNews();
        console.log('Content fetched and updated.');
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


