// services/mockSocketService.ts
type EventCallback = (...args: any[]) => void;

// Singleton event emitter to simulate a WebSocket connection for Nexus features
class EventEmitter {
    private listeners: { [event: string]: EventCallback[] } = {};

    on(event: string, callback: EventCallback) {
        if (!this.listeners[event]) this.listeners[event] = [];
        this.listeners[event].push(callback);
    }

    off(event: string, callback: EventCallback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    emit(event: string, ...args: any[]) {
        // Simulate broadcast with a small, random latency
        setTimeout(() => {
            if (this.listeners[event]) {
                this.listeners[event].forEach(cb => cb(...args));
            }
        }, Math.random() * 50 + 20);
    }
}

// Export a single instance to be shared across the application
export const nexusEvents = new EventEmitter();
