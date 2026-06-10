// api/get-email.js
export default function handler(req, res) {
    const email = process.env.TEMADDRESS;
    
    if (!email) {
        return res.status(500).json({ error: "TEMADDRESS environment variable not set" });
    }

    res.status(200).json({ email: email });
}
