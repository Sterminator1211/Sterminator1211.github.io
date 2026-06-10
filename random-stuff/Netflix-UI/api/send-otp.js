// api/send-otp.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { otp, to } = req.body;

    if (!otp || !to) {
        return res.status(400).json({ error: 'Missing OTP or email' });
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'SpatialAV <noreply@resend.dev>', // You can change this after verifying a domain
                to: to,
                subject: 'Your SpatialAV Verification Code',
                html: `
                    <h2>Your verification code is: <strong>${otp}</strong></h2>
                    <p>This code expires in 10 minutes.</p>
                    <p>Thank you for choosing SpatialAV!</p>
                `
            })
        });

        if (response.ok) {
            res.status(200).json({ success: true });
        } else {
            const errorData = await response.text();
            console.error(errorData);
            res.status(500).json({ error: 'Failed to send email' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}
