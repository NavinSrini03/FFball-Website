# Live Draft Setup

This project now has a local live-draft server.

Start it with:

```sh
node server.js
```

Then open:

```text
http://127.0.0.1:4176/admin.html
```

To put it on the internet, see `DEPLOYMENT.md`.

The page will show `Live draft connected` in the bottom-right corner when it is using the shared live draft room.

What syncs live:

- Teams
- Draft order
- Current pick
- Drafted players and rosters
- Trade offers

What stays private to each browser:

- Which team is signed in
- Current page/tab
- Local profile/modal state

For multiple computers, this still needs to be hosted on a reachable network address or deployed online. The current server is the local foundation for live drafting.

For a same-Wi-Fi test later, run:

```sh
HOST=0.0.0.0 PORT=4176 node server.js
```

Then other computers would open the host computer's local network address, for example:

```text
http://192.168.1.25:4176/
```
