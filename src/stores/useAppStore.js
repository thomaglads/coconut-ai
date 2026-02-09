import { create } from 'zustand';

const useAppStore = create((set) => ({
    // Chat State
    messages: [{ text: "Hello! I'm your Offline Data Analyst. Upload a CSV to get started.", sender: 'bot', timestamp: Date.now() }],
    isThinking: false,
    addMessage: (msg) => set((state) => ({ messages: [...state.messages, { ...msg, timestamp: Date.now() }] })),
    setThinking: (status) => set({ isThinking: status }),

    // Data State
    activeTable: null,
    schema: [],
    isModelLoaded: false,
    setModelLoaded: (val) => set({ isModelLoaded: val }),
    loadTable: (tableName, schema) => set({ activeTable: tableName, schema }),

    // Visualization State
    visualConfig: null, // { type: 'bar'|'line'|'kpi', data: [], title: '' }
    setVisualConfig: (config) => set({ visualConfig: config }),

    // Error Handling
    error: null,
    setError: (err) => set({ error: err }),
    clearError: () => set({ error: null }),

    // Python Engine Status
    pythonStatus: 'loading', // 'loading' | 'ready' | 'error'
    setPythonStatus: (status) => set({ pythonStatus: status })
}));

export default useAppStore;
