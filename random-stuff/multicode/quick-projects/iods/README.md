# IODS

IODS is a lightweight API for storing JSON uploads from iOS Shortcuts directly in a GitHub repository using Vercel Functions.

## Features

- Upload JSON with `POST /api/upload`
- One JSON file per upload
- List uploads
- Get the latest upload
- Fetch individual uploads
- TypeScript backend
- GitHub Pages frontend
- GitHub repository used as persistent storage

---

## Repository Layout

```text
api/
lib/
public/
data/
```

---

## Environment Variables

Create these variables in your Vercel project:

| Name | Description |
|------|-------------|
| `GITHUB_TOKEN` | GitHub Personal Access Token |
| `GITHUB_OWNER` | Repository owner |
| `GITHUB_REPO` | Repository name |
| `GITHUB_BRANCH` | Usually `main` |
| `API_KEY` | Secret required to upload |

---

## API

### Upload

POST `/api/upload`

Headers

```
x-api-key: YOUR_KEY
Content-Type: application/json
```

Body

```json
{
  "message": "Hello World"
}
```

---

### List

GET `/api/list`

---

### Latest

GET `/api/latest`

---

### File

GET `/api/file?name=filename.json`

---

## Deploy

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add the required environment variables.
4. Deploy.
5. Point your frontend to your Vercel URL.

---

## iOS Shortcuts

Use the **Get Contents of URL** action.

Method:

```
POST
```

Headers:

```
x-api-key
```

Request Body:

```
JSON
```

URL:

```
https://YOUR_PROJECT.vercel.app/api/upload
```

---

## License

MIT
