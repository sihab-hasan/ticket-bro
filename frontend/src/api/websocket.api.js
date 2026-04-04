import { storageUtils } from '@/utils/storageUtils';

class WebSocketService {
  ws = null;
  listeners = {};

  connect(baseUrl) {
    const token = storageUtils.getAccessToken();
    const url = `${baseUrl}?token=${token}`;
    this.ws = new WebSocket(url);
    this.ws.onmessage = (e) => {
      try {
        const { event, data } = JSON.parse(e.data);
        (this.listeners[event] || []).forEach(cb => cb(data));
      } catch {
        // Ignore invalid JSON
      }
    };
    this.ws.onclose = () => { setTimeout(() => this.connect(baseUrl), 5000); };
  }

  on(event, cb)  { this.listeners[event] = [...(this.listeners[event]||[]), cb]; }
  off(event, cb) { this.listeners[event] = (this.listeners[event]||[]).filter(l => l !== cb); }

  send(event, data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  disconnect() { this.ws?.close(); this.ws = null; }
}

export default new WebSocketService();
