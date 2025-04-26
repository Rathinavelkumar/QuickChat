# Python Random Web Chat (Production Ready, Render.com)

A production-ready Python web chat app that randomly pairs users for real-time chat, with no registration and no database. Designed for easy deployment on [Render.com](https://render.com/).

## Features
- Randomly pairs users online for chat
- No registration or login required
- Real-time messaging (WebSockets)
- Modern, minimal, responsive UI
- No database or persistent storage (all state in memory)
- Single app serves both backend and frontend
- Production-ready setup

## Project Structure
```
QuickChat/
  main.py
  requirements.txt
  static/
    index.html
    style.css
    app.js
  .gitignore
  README.md
```

## Production Notes
- **Stateless**: All state is in memory; scaling horizontally will split user pools per process. For true global scale, add a shared store (like Redis), but this is intentionally omitted for simplicity and privacy.
- **WebSockets**: Uses FastAPI + Uvicorn with standard WebSocket support.
- **Security**: No user data or registration is stored. For public deployment, consider enabling HTTPS and setting appropriate CORS headers if needed.
- **Resource Usage**: Memory usage is minimal, but all connections are in-memory; if the process restarts, all chat sessions will reset.

## Deployment on Render.com
1. **Create a new Web Service** on Render.com
    - Environment: Python 3
    - Build Command: `pip install -r requirements.txt`
    - Start Commnad[Dev]: `python -m uvicorn main:app --host 0.0.0.0 --port 10000`
    - Start Command[PROD]: `uvicorn main:app --host 0.0.0.0 --port 10000 --proxy-headers --forwarded-allow-ips="*" --workers 1`
2. **Deploy your repo** (push this folder to GitHub and connect it to Render).
3. Visit your Render URL to use the app!

## Local Development
```bash
python -m venv env
source env/Scripts/activate  # On Windows use: env\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

## .gitignore
See `.gitignore` for recommended ignores (env, cache, IDE files, etc).

---
Enjoy chatting randomly and anonymously!
