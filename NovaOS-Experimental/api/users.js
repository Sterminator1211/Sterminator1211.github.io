import { put, get } from '@vercel/blob';

const BLOB_PATH = 'data/users.json';

// Helper to get current data
async function getUsersData() {
  try {
    const { url } = await get(BLOB_PATH);
    const res = await fetch(url);
    return await res.json();
  } catch {
    return { users: [] };
  }
}

// Helper to save data
async function saveUsersData(data) {
  await put(BLOB_PATH, JSON.stringify(data, null, 2), {
    access: 'public',
    contentType: 'application/json',
  });
}

// GET all users or specific user
export default async function handler(req, res) {
  if (req.method === 'GET') {
    const data = await getUsersData();
    res.status(200).json(data);
  } 
  else if (req.method === 'POST') {
    const { username, password, action, notes, settings } = req.body;

    let data = await getUsersData();

    if (action === 'signup') {
      if (data.users.some(u => u.username === username)) {
        return res.status(400).json({ error: 'Username exists' });
      }
      data.users.push({ username, password, notes: "", settings: {} });
    } 
    else if (action === 'login') {
      const user = data.users.find(u => u.username === username && u.password === password);
      return res.status(200).json({ success: !!user, user });
    } 
    else if (action === 'save-notes') {
      const user = data.users.find(u => u.username === username);
      if (user) user.notes = notes;
    } 
    else if (action === 'save-settings') {
      const user = data.users.find(u => u.username === username);
      if (user) user.settings = settings;
    }

    await saveUsersData(data);
    res.status(200).json({ success: true });
  } 
  else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
