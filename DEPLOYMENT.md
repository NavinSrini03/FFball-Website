# Put The Live Draft Online

The site can now run as a hosted Node web app. The live draft state is shared through the server, so everyone must use the hosted URL instead of `localhost`.

## Public Launch Checklist

Use this route when you want the website to be visible from any computer, phone, or tablet on the internet:

1. Put this folder in a GitHub repository.
2. Deploy that repository as a Render web service.
3. Add the persistent disk described below.
4. Share the Render URL with your league.

This project should be hosted as a Node web service, not as a static website. Static-only hosts will load the page, but live draft syncing and saved league state will not work correctly.

## Recommended: Render

1. Put this project in a GitHub repository.
2. Go to Render and create a new **Blueprint** or **Web Service** from the repo.
3. Use these settings if creating a Web Service manually:
   - Runtime: `Node`
   - Build command: leave blank or use `npm install`
   - Start command: `node server.js`
   - Health check path: `/healthz`
4. Add a persistent disk:
   - Mount path: `/var/data`
   - Size: `1 GB`
5. Add environment variable:
   - `DATA_DIR=/var/data`
6. Deploy.

After deployment, open:

```text
https://your-render-app.onrender.com/
```

Admin page:

```text
https://your-render-app.onrender.com/admin.html
```

## What Works Online

- Everyone opens the same hosted URL.
- Each person signs into their own fantasy team in their own browser.
- Draft picks sync live.
- Rosters, draft order, current pick, and trade offers sync live.
- The `Live draft connected` badge confirms the browser is connected to the shared room.

## Important

Do not use `localhost` for a real online draft. `localhost` only points to each person's own computer.

If the host does not provide persistent storage, the live draft can reset when the server restarts. Use a persistent disk or move the state to a hosted database before relying on it for a real league draft.

The local `data/` folder is intentionally not committed. Render should use the mounted `/var/data` disk for the public draft state.

## Other Hosting Options

Any host that can run a Node server should work:

- Railway
- Fly.io
- Heroku-style hosts using `Procfile`
- Docker hosts using the included `Dockerfile`

The server uses:

```text
PORT
HOST
DATA_DIR
```

Most hosting platforms set `PORT` automatically. For internet hosting, `HOST` should be `0.0.0.0` or left unset.
