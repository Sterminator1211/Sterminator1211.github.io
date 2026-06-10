// api/send-otp.js
export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();

    const { otp, to } = req.body;

    const emailBody = `
        Your SpatialAV 6-digit code is: ${otp}

        This code was requested for verification.
        Static phone: ${process.env.STATIC_PHONE || 'Configured in account'}
        Expires in 10 minutes.
    `;

    // === SIMPLE SEND USING FETCH TO A MAIL SERVICE ===
    // Recommended: Sign up for free tier at resend.com or brevo.com and use their API

    try {
        // Example with Resend (easiest - replace with your key from secrets)
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'SpatialAV <onboarding@yourdomain.com>',   // verified domain
                to: to,
                subject: 'Your SpatialAV Verification Code',
                text: emailBody
            })
        });

        if (response.ok) {
            res.status(200).json({ success: true });
        } else {
            res.status(500).json({ error: 'Send failed' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
}
