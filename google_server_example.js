// Example Node.js server showing secure verification of Google ID tokens
// Install: npm install express google-auth-library body-parser

const express = require('express');
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');

const app = express();
app.use(bodyParser.json());

// Replace with your Google client ID
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

// Verify token endpoint
app.post('/verify-id-token', async(req, res) => {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'idToken required' });

    try {
        const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
        const payload = ticket.getPayload();
        // payload contains email, sub (user id), name, picture, etc.
        // Use payload.sub as Google's stable account id.

        // TODO: lookup or create local account, ensure email matches, then link account server-side

        return res.json({ ok: true, payload });
    } catch (err) {
        console.error('verify error', err);
        return res.status(401).json({ error: 'Invalid ID token' });
    }
});

// Example secure link endpoint: (POST) /link-google -> { idToken, localUserId }
app.post('/link-google', async(req, res) => {
    const { idToken, localUserId } = req.body;
    if (!idToken || !localUserId) return res.status(400).json({ error: 'idToken and localUserId required' });

    try {
        const ticket = await client.verifyIdToken({ idToken, audience: CLIENT_ID });
        const payload = ticket.getPayload();
        const googleSub = payload.sub;
        const googleEmail = payload.email;

        // TODO: verify localUserId belongs to an authenticated session on server
        // Then persist link between local user and googleSub in your DB.

        return res.json({ ok: true, googleSub, googleEmail });
    } catch (err) {
        console.error('link verify error', err);
        return res.status(401).json({ error: 'Invalid ID token' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Example server listening on ${PORT}`));