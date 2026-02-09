class InsightEngine {
    constructor() {
        if (InsightEngine.instance) return InsightEngine.instance;
        InsightEngine.instance = this;
    }

    async initialize(modelPath) {
        console.log('🥥 [Renderer] initializing...');
        try {
            const result = await window.electronAPI.initDB();
            if (!result.success) throw new Error(result.error);
            return true;
        } catch (e) {
            console.error(e);
            throw e;
        }
    }

    async executeQuery(sql) {
        const result = await window.electronAPI.executeQuery(sql);
        if (!result.success) throw new Error(result.error);
        return result.results;
    }

    async loadCSV(content, tableName) {
        console.log('🥥 [Renderer] Loading CSV via IPC...');
        const result = await window.electronAPI.importCSV(content, tableName);
        if (!result.success) throw new Error(result.error);
        return result;
    }

    async loadModel(path) {
        console.log('🦙 [Renderer] Loading Model:', path);
        const result = await window.electronAPI.loadModel(path);
        if (!result.success) throw new Error(result.error);
        return true;
    }

    async loadDefaultModel() {
        console.log('🦙 [Renderer] Loading Default Model...');
        const result = await window.electronAPI.loadDefaultModel();
        if (!result.success) throw new Error(result.error);
        return true;
    }

    async ask(question, schema) {
        console.log('🤖 [Renderer] Asking:', question);
        const result = await window.electronAPI.generateQuery(schema, question);
        if (!result.success) throw new Error(result.error);
        return result;
    }
}

export const insightEngine = new InsightEngine();
export default insightEngine;
