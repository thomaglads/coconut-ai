# 🥥 Coconut AI

**I was tired of waiting 40 seconds for an AI to answer a simple data question.**

So I built Coconut AI. It's a local, privacy-first data analyst that runs on your laptop. It doesn't send your data to the cloud, it doesn't track you, and it doesn't cost $20/month.

It just works.

## ⚡ Why I built this
Most "AI Data Analysts" are just wrappers around ChatGPT. They upload your CSVs to a server, process them (slowly), and charge you for the privilege.

I wanted something different:
*   **Zero Latency:** Queries should be instant.
*   **Zero Privacy Risk:** My financial data stays on my machine.
*   **Zero "Cold Starts":** No waiting for a Python container to spin up in the cloud.

## 🛠️ How it works (The "Hybrid-RAG" stuff)
I realized we don't need a massive LLM to do basic math.

1.  **Intent Router:** When you ask "Predict sales next month," a tiny JS engine catches it instantly.
2.  **Math Engine:** It runs the forecast locally in milliseconds. 0% hallucination because it's actual code, not an LLM guessing numbers.
3.  **Local LLM:** If you ask "What is the average transaction value?"—it uses a small, optimized Llama-3.2 model to write the SQL.

**Result:** It starts in <1 second and runs comfortably on my 8GB RAM MacBook.

## 📦 Download & Install
I've built installers for Windows (X64 & Arm64).

*   **[Download Installer (.exe)](https://github.com/thomaglads/coconut-ai/releases/download/v1.0.0-beta/Coconut%20AI%20Setup%201.0.0-beta.exe)**
*   **[Download Portable (.exe)](https://github.com/thomaglads/coconut-ai/releases/download/v1.0.0-beta/Coconut%20AI%201.0.0-beta.exe)**

*(Mac & Linux builds are coming, but you can run from source easily).*

## 🧪 Beta Testing
This is v1.0.0-beta. It's stable, but I'm looking for feedback.
If you break it, let me know.

**Contact me directly:**
*   📧 Email: this.thoma@gmail.com
*   💼 LinkedIn: [Thoma Glads Choppala](https://www.linkedin.com/in/thoma-glads-ch/)

## 👩‍💻 Run from Source
If you're a dev and want to see how the sausage is made:

```bash
# 1. Clone the repo
git clone https://github.com/thomaglads/coconut-ai.git
cd coconut-ai

# 2. Install dependencies
npm install

# 3. Download the AI Model
# Download 'Llama-3.2-1B-Instruct-Q4_K_M.gguf' from HuggingFace
# Place it in a folder named /models at the root of the project

# 4. Start the app
npm run electron:dev
```

## 🔒 Privacy Promise
I wrote this tool because I care about privacy.
*   No telemetry.
*   No "usage stats" sent to me.
*   Your data never leaves your `C:\` drive.

Enjoy. 🥥