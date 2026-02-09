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

## 📦 Getting Started

### Download for Windows
Coconut AI is currently in Beta. You can download the latest installers (x64 and ARM64) from our official releases page:

👉 **[Download Latest Release](https://github.com/thomaglads/coconut-ai/releases)**

*   **Installer (.exe)**: Best for most users. Includes desktop shortcuts.
*   **Portable (.exe)**: Run directly from your downloads folder or a USB drive. No installation required.

---

### 👩‍💻 Run from Source
If you are a developer or want to verify the privacy of the app yourself, you can run Coconut AI locally via Node.js:

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/thomaglads/coconut-ai.git
    cd coconut-ai
    ```
2.  **Install Dependencies**: `npm install`
3.  **Local AI Setup**: 
    - Download `Llama-3.2-1B-Instruct-Q4_K_M.gguf` from HuggingFace.
    - Create a `/models` folder in the project root and place the file inside.
4.  **Launch**: `npm run electron:dev`

---

## 🧪 Support & Feedback
Since this is a beta release, your feedback is critical. If you encounter bugs or have suggestions, please reach out directly:

*   🐛 **Issue Tracker**: [github.com/thomaglads/coconut-ai/issues](https://github.com/thomaglads/coconut-ai/issues)
*   📧 **Direct Email**: [this.thoma@gmail.com](mailto:this.thoma@gmail.com)
*   💼 **LinkedIn**: [Thoma Glads Choppala](https://www.linkedin.com/in/thoma-glads-ch/)

## 🔒 Privacy Promise
I wrote this tool because I care about privacy.
*   No telemetry.
*   No "usage stats" sent to me.
*   Your data never leaves your `C:\` drive.

Enjoy. 🥥