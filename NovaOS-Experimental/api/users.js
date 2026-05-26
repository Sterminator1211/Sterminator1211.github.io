import { put, get } from '@vercel/blob';

const BLOB_PATH = 'novaos/data/users.json';

async function getUsersData() {
  try {
    const { url } = await get(BLOB_PATH);
    const response = await fetch(url);
    return await response.json();
  } catch (e) {
    return { users: [] };
  }
}

async function saveUsersData(data) {
  await put(BLOB_PATH, JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const data = await getUsersData();
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    try {
      const { action, username, password, notes, settings } = req.body;
      let data = await getUsersData();

      if (action === 'signup') {
        if (data.users.some(u => u.username === username)) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        data.users.push({ username, password, notes: "", settings: {} });
      } 
      else if (action === 'login') {
        const user = data.users.find(u => u.username === username && u.password === password);
        if (user) {
          return res.status(200).json({ success: true, user });
        } else {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
      } 
      else if (action === 'save-notes') {
        const user = data.users.find(u => u.username === username);
        if (user) user.notes = notes;
      } 
      else if (action === 'save-settings') {
        const user = data.users.find(u => u.username === username);
        if (user) user.settings = settings || {};
      }

      await saveUsersData(data);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
