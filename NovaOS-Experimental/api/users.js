export default async function handler(req, res) {
  // Allow both GET and POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BLOB_PATH = 'data/users.json';

  try {
    if (req.method === 'GET') {
      // Return empty data for now (we'll improve later)
      return res.status(200).json({ users: [] });
    }

    if (req.method === 'POST') {
      const { action, username, password, notes, settings } = req.body;

      // Simple simulation for now - we'll connect real Blob later
      if (action === 'signup') {
        return res.status(200).json({ success: true });
      }
      if (action === 'login') {
        return res.status(200).json({ 
          success: true, 
          user: { username, password, notes: "", settings: {} } 
        });
      }
      if (action === 'save-notes') {
        return res.status(200).json({ success: true });
      }
      if (action === 'save-settings') {
        return res.status(200).json({ success: true });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
}
