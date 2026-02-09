import React from 'react';
import useAppStore from '../stores/useAppStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { FileUp, TrendingUp, Download, Zap } from 'lucide-react';
import insightEngine from '../services/InsightEngine';

const VisualizationCanvas = () => {
    const { activeTable, visualConfig, loadTable, addMessage, pythonStatus } = useAppStore();



    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;
                const tableName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
                const result = await insightEngine.loadCSV(content, tableName);

                if (result) {
                    loadTable(tableName, result.columns);
                    addMessage({
                        text: `✅ **Data Loaded Successfully**\n\nAnalyzed **${result.rowCount.toLocaleString()}** records from \`${file.name}\`.\nReady for executive analysis.`,
                        sender: 'bot'
                    });
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error(error);
            addMessage({ text: "❌ Data Ingestion Failed. Please verify file integrity.", sender: 'bot' });
        }
    };

    // Executive Empty State (Upload)
    if (!activeTable) {
        return (
            <div className="flex-1 bg-gradient-to-br from-slate-950 via-[#0f1014] to-slate-950 flex flex-col items-center justify-center p-12 text-slate-400 relative overflow-hidden">
                {/* Ambient Background Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl mix-blend-screen animate-pulse-slow"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl mix-blend-screen animate-pulse-slow delay-1000"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mb-8 border border-slate-700/50 shadow-2xl ring-1 ring-white/10 group hover:scale-105 transition-transform duration-500">
                        <FileUp size={32} className="text-blue-400 group-hover:text-blue-300 transition-colors" />
                    </div>

                    <h1 className="text-3xl font-light text-slate-100 mb-3 tracking-tight">
                        Insight<span className="font-bold text-blue-500">Engine</span> Workspace
                    </h1>
                    <p className="text-sm text-slate-500 max-w-sm text-center mb-10 font-light leading-relaxed">
                        Secure, offline analytics environment. <br />
                        Upload data to begin your session.
                    </p>

                    <label className="cursor-pointer group relative overflow-hidden rounded-lg bg-blue-600 px-8 py-3 text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-95 border border-blue-500/50">
                        <span className="relative z-10 flex items-center gap-3 font-medium tracking-wide text-sm">
                            <UploadIcon size={16} />
                            Ingest CSV Data
                        </span>
                        <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>
            </div>
        );
    }

    // Default/Empty Visualization State (No Query Yet)
    if (!visualConfig) {
        return (
            <div className="flex-1 bg-gradient-to-br from-slate-950 via-[#0f1014] to-slate-950 p-8 flex items-center justify-center">
                <div className="text-center space-y-4 opacity-40">
                    <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto border border-slate-800">
                        <TrendingUp size={32} className="text-slate-600" />
                    </div>
                    <p className="text-slate-500 font-light tracking-wide uppercase text-xs">Awaiting Query Execution</p>
                </div>
            </div>
        );
    }

    // Rendering Logic
    const renderVisual = () => {
        if (!visualConfig || !visualConfig.data || visualConfig.data.length === 0)
            return <div className="text-slate-500 flex items-center justify-center h-full">No Available Data</div>;

        const data = visualConfig.data;
        const keys = Object.keys(data[0]);

        // SMART COLUMN DETECTION
        // Prioritize "Date/Time" columns for X-Axis
        const dateKey = keys.find(k => /date|time|year|month/i.test(k)) || keys[0];
        // Prioritize "Numeric" columns (excluding the date key) for Y-Axis
        const valueKey = keys.find(k => k !== dateKey && typeof data[0][k] === 'number') || keys.find(k => typeof data[0][k] === 'number') || keys[1];

        // Ensure we handle non-numeric data gracefully (e.g. if everything is text)
        // If NO numeric column, we default to the second column anyway.

        switch (visualConfig.type) {
            case 'single':
                const label = keys[0];
                const value = data[0][label];
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in zoom-in duration-500">
                        <h3 className="text-sm text-slate-400 font-medium uppercase tracking-widest mb-4 border-b border-slate-800 pb-1">{label}</h3>
                        <div className="text-7xl font-light text-white tabular-nums tracking-tighter drop-shadow-2xl bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                    </div>
                );

            case 'line':
                // Check if we actually have a valueKey to plot
                if (!valueKey) return <div className="flex items-center justify-center h-full text-slate-500">Could not identify numeric data to plot.</div>;

                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey={dateKey}
                                stroke="#64748b"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => val.toLocaleString()}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#f8fafc', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' }}
                                itemStyle={{ color: '#94a3b8' }}
                            />
                            <Area
                                type="monotone"
                                dataKey={valueKey}
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'bar':
                if (!valueKey) return <div className="flex items-center justify-center h-full text-slate-500">Could not identify numeric data to plot.</div>;

                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey={dateKey} // Use smart key
                                stroke="#64748b"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#1e293b', opacity: 0.5 }}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '4px', color: '#f8fafc' }}
                            />
                            <Bar
                                dataKey={valueKey} // Use smart key
                                fill="#3b82f6"
                                radius={[2, 2, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'table':
            default:
                return (
                    <div className="w-full h-full overflow-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="sticky top-0 bg-slate-900/90 backdrop-blur text-xs uppercase font-semibold text-slate-500 tracking-wider shadow-sm z-10">
                                <tr>
                                    {keys.map((key) => (
                                        <th key={key} className="px-6 py-4 border-b border-slate-800">{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/30">
                                {data.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors group">
                                        {Object.values(row).map((val, i) => (
                                            <td key={i} className="px-6 py-3 font-light text-slate-300 group-hover:text-white transition-colors">{val}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
        }
    };

    return (
        <div className="flex-1 bg-gradient-to-br from-slate-950 via-[#0f1014] to-slate-950 p-8 flex flex-col min-h-0 relative">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest mb-1">Analytics Dashboard</span>
                    <h2 className="text-xl font-light text-slate-100 flex items-center gap-3">
                        {visualConfig.title || "Query Result Analysis"}
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">
                            {visualConfig.type}
                        </span>
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    {visualConfig.type === 'line' && (
                        <button
                            onClick={async () => {
                                // Dynamic Import for Performance
                                const { simpleForecaster } = await import('../services/simpleForecaster');
                                const headers = Object.keys(visualConfig.data[0]);
                                const dateCol = headers.find(h => /date|time|year|month/i.test(h)) || headers[0];
                                const valCol = headers.find(h => h !== dateCol && typeof visualConfig.data[0][h] === 'number') || headers[1];

                                if (!dateCol || !valCol) { alert('Could not detect Date/Value columns for forecasting.'); return; }

                                addMessage({ text: "⚡ **Running Instant Forecast...**\nAnalyzing trend using local statistical model.", sender: 'bot' });
                                const forecast = await simpleForecaster.createForecast(visualConfig.data, dateCol, valCol);

                                if (forecast.success) {
                                    addMessage({
                                        text: `### 📈 Predictive Analysis Complete\n\n**Trend**: ${forecast.result.trend.toUpperCase()} trajectory identified.\n\n**Confidence (R²)**: \`${(forecast.confidence * 100).toFixed(1)}%\`\n\n${forecast.explanation}`,
                                        sender: 'bot'
                                    });
                                } else {
                                    addMessage({ text: `❌ **Analysis Failed**: ${forecast.error}`, sender: 'bot' });
                                }
                            }}
                            className="text-xs px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/20 flex items-center gap-2 transition-all hover:shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)] cursor-pointer"
                            title="Run Instant Forecast"
                        >
                            <Zap size={14} className="text-indigo-400" />
                            Run Forecast
                        </button>
                    )}
                    <button
                        onClick={() => {
                            const headers = Object.keys(visualConfig.data[0]);
                            const csvContent = [headers.join(','), ...visualConfig.data.map(row => headers.map(key => row[key]).join(','))].join('\n');
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', 'analysis_export.csv');
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="text-xs px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 flex items-center gap-2 transition-colors"
                    >
                        <Download size={14} />
                        Export
                    </button>
                </div>
            </div>

            {/* Main Visual Card */}
            <div className="flex-1 min-h-0 bg-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-800/60 p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-bl-3xl pointer-events-none transition-opacity opacity-50 group-hover:opacity-100"></div>
                {renderVisual()}
            </div>

            <div className="mt-4 flex justify-between items-center text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                <span>Local Execution Environment</span>
                <span>Secure • Offline • Encrypted</span>
            </div>
        </div>
    );
};

// Reusable Icon
const UploadIcon = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
    </svg>
);

export default VisualizationCanvas;
