export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ users: [] });
  }

  if (req.method === 'POST') {
    try {
      const { action, username, password, notes } = req.body || {};

      if (action === 'login') {
        return res.status(200).json({ 
          success: true, 
          user: { username: username || "test", notes: "", settings: {} } 
        });
      }

      if (action === 'signup') {
        return res.status(200).json({ success: true });
      }

      if (action === 'save-notes') {
        return res.status(200).json({ success: true });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
