const Database = require('better-sqlite3');
const path = require('path');
const { parse } = require('csv-parse/sync');
const simpleForecaster = require('../services/simpleForecaster');

class MainInsightEngine {
    constructor() {
        this.db = null;
        this.llama = null;
        this.session = null;
        this.modelPath = null;
    }

    async initialize(dbPath = ':memory:') {
        try {
            console.log('🥥 [Main] Initializing InsightEngine...');
            this.db = new Database(dbPath, { verbose: console.log });
            console.log('✅ [Main] SQLite initialized');
            return { success: true };
        } catch (error) {
            console.error('❌ [Main] Init Failed:', error);
            return { success: false, error: error.message };
        }
    }

    async loadModel(modelPath) {
        try {
            console.log(`🦙 [Main] Loading Llama model from ${modelPath}...`);
            this.modelPath = modelPath;

            // Dynamic import for ESM compatibility (V3 API)
            const { getLlama, LlamaChatSession } = await import('node-llama-cpp');

            const llama = await getLlama();
            this.llama = await llama.loadModel({
                modelPath: modelPath,
                gpuLayers: 0 // Force CPU to avoid Vulkan/GPU OOM errors
            });

            const context = await this.llama.createContext({
                contextSize: 2048 // Limit context to save RAM
            });
            this.session = new LlamaChatSession({
                contextSequence: context.getSequence()
            });

            console.log('✅ [Main] Llama initialized');
            return { success: true };
        } catch (error) {
            console.error('❌ [Main] Model Load Failed:', error);
            return { success: false, error: error.message };
        }
    }

    executeQuery(sql) {
        if (!this.db) {
            return { success: false, error: "Database not initialized" };
        }
        try {
            const cleanSql = sql.split(';')[0];
            console.log(`🥥 [Main] Executing SQL: "${cleanSql}"`);

            const stmt = this.db.prepare(cleanSql);
            const results = stmt.all();

            console.log(`🥥 [Main] Result Count: ${results.length}`);
            return { success: true, results };
        } catch (error) {
            console.error('[Main] SQL Error:', error);
            return { success: false, error: error.message };
        }
    }

    loadCSV(content, tableName) {
        if (!this.db) return { success: false, error: "DB not initialized" };

        try {
            const records = parse(content, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                bom: true // Handle Excel BOM
            });

            if (records.length === 0) return { success: false, error: "Empty CSV" };

            const keys = Object.keys(records[0]);
            // Heuristic: Detect types
            const schema = keys.map(k => {
                const sample = records[0][k];
                const isNum = !isNaN(parseFloat(sample)) && isFinite(sample);
                return `"${k}" ${isNum ? 'REAL' : 'TEXT'}`;
            }).join(', ');

            this.db.exec(`DROP TABLE IF EXISTS "${tableName}";`);
            this.db.exec(`CREATE TABLE "${tableName}" (${schema});`);

            const placeholders = keys.map(() => '?').join(', ');
            const insert = this.db.prepare(`INSERT INTO "${tableName}" VALUES (${placeholders})`);

            const insertMany = this.db.transaction((data) => {
                for (const row of data) insert.run(Object.values(row));
            });

            insertMany(records);
            console.log(`✅ [Main] Loaded ${records.length} rows into ${tableName}`);

            return {
                success: true,
                tableName,
                rowCount: records.length,
                columns: keys,
                sample: records.slice(0, 3)
            };
        } catch (error) {
            console.error('[Main] CSV Load Error:', error);
            return { success: false, error: error.message };
        }
    }
    async generateResponse(question, schema) {
        if (!this.llama) {
            return { success: false, error: "Model not loaded. Please load a GGUF model first." };
        }

        try {
            // Re-initialize session with schema context if needed, or just append to prompt
            // For simplicity, we create a temporary session for independent reasoning or use the main one
            // Ensure session exists
            if (!this.session) {
                const { LlamaChatSession } = await import('node-llama-cpp');
                const context = await this.llama.createContext({
                    contextSize: 2048 // Limit context to save RAM
                });
                this.session = new LlamaChatSession({
                    contextSequence: context.getSequence()
                });
            }

            // Extract table name from schema string "Table "name" columns..."
            const tableMatch = schema.match(/Table "([^"]+)"/);
            const explicitTable = tableMatch ? tableMatch[1] : 'the table';

            // ---------------------------------------------------------
            // 🧠 INTENT ROUTER (The Gatekeeper)
            // Fixes "1B Model Bottleneck" by bypassing LLM for known tasks.
            // ---------------------------------------------------------
            const lowerQuestion = question.toLowerCase();
            const predictionKeywords = ['predict', 'forecast', 'trend', 'future', 'projection'];

            if (predictionKeywords.some(k => lowerQuestion.includes(k))) {
                console.log('🥥 [Router] Prediction Intent Detected -> Bypassing LLM.');

                const manualSQL = `SELECT * FROM "${explicitTable}";`;
                const result = this.executeQuery(manualSQL);
                const data = result.success ? result.results : [];

                if (data.length > 0) {
                    // 🧠 MATHEMATICAL FORECASTING (Direct Math Engine)
                    const keys = Object.keys(data[0]);
                    const dateCol = keys.find(k => /date|time|year|month|day/i.test(k)) || keys[0];
                    const valCol = keys.find(k => {
                        const val = parseFloat(data[0][k]);
                        return !isNaN(val) && isFinite(val) && !/id|date/i.test(k);
                    }) || keys[1];

                    console.log(`🥥 [Router] Running Forecast on columns: ${dateCol}, ${valCol}`);
                    const forecast = simpleForecaster.createForecast(data, dateCol, valCol);

                    if (forecast.success) {
                        return {
                            success: true,
                            thought: `[Intent Router] User asked to "${question}".\n\n**Routing Decision**: Detected "Forecasting" intent. Bypassing LLM for the **Direct Math Engine** to ensure 0% hallucinations.\n\n**Math Engine Result**: ${forecast.explanation}\n\n**Strategy**: Calculated linear regression locally in JS. Found a ${forecast.result.trend} trend with ${Math.round(forecast.confidence * 100)}% confidence.`,
                            sql: manualSQL,
                            data: [...data, ...forecast.forecastPoints],
                            visual_hint: 'line'
                        };
                    }
                }

                return {
                    success: true,
                    thought: `[Intent Router] User asked to "${question}".\nDetected "Forecasting" intent.\n\nRunning Hardcoded Strategy: Retrieve history from \`${explicitTable}\`.`,
                    sql: manualSQL,
                    data: data,
                    visual_hint: 'line'
                };
            }
            // ---------------------------------------------------------

            const prompt = `
[SYSTEM]
You are a Data Analyst Agent.
Your task is to write a SQLite query for the table "${explicitTable}".

Schema: 
${schema}

Instructions:
1. Analyze the Request:
   - "Total", "Sum" -> Use SUM(Column)
   - "How many" -> Use COUNT(*) to count items, or SUM(Column) to sum values.
   - "List", "Show", "What is" -> SELECT the column directly (NO SUM/COUNT).
   - "Predict", "Forecast", "Future" -> SELECT *ALL* HISTORICAL data (Date + Value) ordered by Date. Do NOT use LIMIT. The app needs full history to forecast.
2. Check the Schema: Use ONLY the columns listed above. Do not guess column names.
3. Construct the SQL using the EXACT table name "${explicitTable}".
4. Output a "Thought" explaining your logic, then the "SQL".

Examples:
(These use FAKE tables. Do not copy them. Use table: "${explicitTable}")

Request: "Total sales for Apples"
Thought: The user wants a sum of 'Sales'. They filtered by 'Apples', so I need WHERE Fruit = 'Apples'.
SQL: \`\`\`sql
SELECT SUM(Sales) FROM fruit_shop WHERE Fruit = 'Apples';
\`\`\`

Request: "What is the price of the Red Dress?"
Thought: The user wants a specific value ('Price'), not a sum. They filtered by 'Red Dress'.
SQL: \`\`\`sql
SELECT Price FROM products WHERE Item_Name = 'Red Dress';
\`\`\`

Request: "Predict next month's sales"
Thought: The user wants a forecast. I need full history. I will select Date and Sales from the table "${explicitTable}" (NOT sales_data).
SQL: \`\`\`sql
SELECT Date, Sales FROM "${explicitTable}" ORDER BY Date ASC;
\`\`\`

Request: "Who has the highest score?"
Thought: The user wants the top student. I should Order By 'Score' DESC and Limit to 1.
SQL: \`\`\`sql
SELECT Student_Name FROM student_scores ORDER BY Score DESC LIMIT 1;
\`\`\`

Current Request:
Question: ${question}

Response:
[/SYSTEM]
`;

            // 1. Ask LLM for Plan/SQL
            console.log('🥥 [Main] Asking Llama...');
            const response1 = await this.session.prompt(prompt, { maxTokens: 256 });
            console.log('🤖 [Main] Raw Response:', response1);

            // Improved SQL Parser
            let sql = null;
            let thought = response1;

            // 1. Check for Markdown code block first (Most Reliable)
            const codeBlockMatch = response1.match(/```sql\s*([\s\S]*?)\s*```/i);
            if (codeBlockMatch) {
                let rawSql = codeBlockMatch[1].trim();
                // STRICT: Cut off at the first semicolon to remove any trailing explanation
                if (rawSql.includes(';')) {
                    rawSql = rawSql.split(';')[0].trim() + ';';
                }
                sql = rawSql;
            } else {
                // 2. Section-based Parsing (Split Strategy)
                // This prevents finding "select" in the "Thought" section.
                // We look for the "SQL:" marker and only analyze text AFTER it.

                let textToAnalyze = response1;
                const sqlMarkerInfo = response1.match(/SQL:\s*/i);

                if (sqlMarkerInfo) {
                    // Only look at the part AFTER "SQL:"
                    textToAnalyze = response1.substring(sqlMarkerInfo.index + sqlMarkerInfo[0].length);
                }

                // Look for SELECT in the targeted text
                // Stop at semicolon OR double newline OR conversational keywords
                const match = textToAnalyze.match(/(SELECT\s+[\s\S]+?)(?=;|\n\s*\n|$)/i);
                if (match) {
                    let rawSql = match[1].trim();

                    // Cleanup: If it captured "This query" or similar at the end due to loose matching
                    const explanationStart = rawSql.search(/\n(This|Here|Note|The query)/i);
                    if (explanationStart !== -1) {
                        rawSql = rawSql.substring(0, explanationStart).trim();
                    }

                    sql = rawSql + ';';
                }
            }

            // Cleanup: Strip any remaining backticks
            if (sql) sql = sql.replace(/`/g, '');

            let dataResults = [];
            if (sql) {
                console.log('🥥 [Main] Executing Generated SQL:', sql);
                const result = this.executeQuery(sql);
                if (result.success) {
                    dataResults = result.results;
                    thought += `\n\n[System] Executed SQL. Found ${dataResults.length} rows.`;
                } else {
                    thought += `\n\n[System] SQL Error: ${result.error}`;
                }
            }

            // 2. Final Answer (if we have data, we might want to summarize it)
            // For now, return the raw thought and data for the UI to handle
            return {
                success: true,
                thought: thought,
                sql: sql,
                data: dataResults, // Return raw data for visualization
                visual_hint: dataResults.length > 0 ? 'table' : 'text'
            };

        } catch (error) {
            console.error('❌ [Main] AI Generation Error:', error);
            return { success: false, error: error.message };
        }
    }
    async runSimulation(appDataPath) {
        console.log('🚀 [Main] Starting Simulation...');
        const fs = require('fs');
        const path = require('path');

        // Simulation Results container
        const results = [];

        // Define Test Cases
        const testFiles = [
            { file: 'ecommerce_orders.csv', question: 'What is the total Amount for Electronics?' },
            { file: 'student_grades.csv', question: 'Who has the highest Math score?' },
            { file: 'inventory.csv', question: 'List items with Stock_Level below 20' },
            { file: 'weather.csv', question: 'What was the temperature in London on 2023-06-01?' },
            { file: 'employee_shifts.csv', question: 'How many sales did Jane Smith make?' }
        ];

        // Ensure model is loaded first (check this.llama)
        if (!this.llama) {
            // Try to load default model
            try {
                const defaultPath = path.join(__dirname, '../../models/Llama-3.2-1B-Instruct-Q4_K_M.gguf');
                await this.loadModel(defaultPath);
            } catch (e) {
                return { success: false, error: "Model could not be loaded for simulation." };
            }
        }

        for (const test of testFiles) {
            try {
                // Adjust path to where we saved the files
                // We saved them in c:\Users\thist\InsightEngine_Desktop\test_data
                // __dirname is src/main
                const filePath = path.join(__dirname, '../../test_data', test.file);

                const tableName = test.file.replace('.csv', '').replace(/[^a-zA-Z0-9]/g, '_');

                results.push(`📂 **Processing**: \`${test.file}\``);

                if (!fs.existsSync(filePath)) {
                    results.push(`❌ File not found: ${filePath}`);
                    continue;
                }

                const content = fs.readFileSync(filePath, 'utf8');
                const loadResult = this.loadCSV(content, tableName);

                if (!loadResult.success) {
                    results.push(`❌ CSV Load Failed: ${loadResult.error}`);
                    continue;
                }

                // Construct Schema Context
                const schemaString = `Table "${tableName}" columns: (${loadResult.columns.join(', ')})`;
                results.push(`❓ **Question**: "${test.question}"`);

                const response = await this.generateResponse(test.question, schemaString);

                if (response.success) {
                    results.push(`💡 **Generated SQL**: \n\`\`\`sql\n${response.sql || 'NONE'}\n\`\`\``);
                    if (response.data && response.data.length > 0) {
                        results.push(`✅ **Result**: Found ${response.data.length} rows.`);
                        results.push(`   *Sample*: ${JSON.stringify(response.data[0])}`);
                    } else {
                        results.push(`⚠️ **Result**: 0 rows found.`);
                    }
                } else {
                    results.push(`❌ **AI Error**: ${response.error}`);
                }
                results.push('---');
            } catch (err) {
                results.push(`❌ **System Error**: ${err.message}`);
            }
        }

        return { success: true, report: results.join('\n') };
    }
}

module.exports = new MainInsightEngine();
