import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from typing import List, Dict, Optional
import asyncio

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

waiting_users: List[WebSocket] = []
active_pairs: Dict[WebSocket, WebSocket] = {}
lock = asyncio.Lock()

@app.get("/")
async def get():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return HTMLResponse(content=f.read(), status_code=200)

@app.get("/sitemap.xml")
async def sitemap():
    return FileResponse("static/sitemap.xml", media_type="application/xml")

# --- SITE VERIFICATION ROUTE ---
@app.get("/sw.js")
async def sw_js():
    return FileResponse("sw.js")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    partner: Optional[WebSocket] = None
    try:
        # Pair logic
        async with lock:
            if waiting_users:
                partner = waiting_users.pop(0)
                active_pairs[websocket] = partner
                active_pairs[partner] = websocket
                await websocket.send_json({"action": "paired"})
                await partner.send_json({"action": "paired"})
            else:
                waiting_users.append(websocket)
                await websocket.send_json({"action": "waiting"})
        while True:
            data = await websocket.receive_json()
            if websocket in active_pairs:
                partner = active_pairs[websocket]
                await partner.send_json({"action": "message", "message": data.get("message", "")})
    except WebSocketDisconnect:
        async with lock:
            # Remove from waiting if still waiting
            if websocket in waiting_users:
                waiting_users.remove(websocket)
            # Handle disconnect if paired
            if websocket in active_pairs:
                partner = active_pairs.pop(websocket)
                if partner in active_pairs:
                    active_pairs.pop(partner)
                try:
                    await partner.send_json({"action": "partner_disconnected"})
                except:
                    pass
                # Return partner to waiting queue
                waiting_users.append(partner)
                await partner.send_json({"action": "waiting"})
