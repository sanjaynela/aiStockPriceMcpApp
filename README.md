# AI Stock Price App with MCP

![App Screenshot](assets/screenshot.png)

This project demonstrates how to build a full-stack application using the **Model Context Protocol (MCP)** to connect an AI agent (simulated) to real-time data.

## 🧠 Understanding MCP (Model Context Protocol)

### The Problem: "Brain in a Jar"
Large Language Models (LLMs) like Claude or GPT-4 are powerful, but they are isolated. They:
-   Don't have access to your local files.
-   Can't query private databases.
-   **Can't fetch real-time data** (like stock prices).

Traditionally, connecting an LLM to data required writing custom "glue code" for every single integration.

### The Solution: A Universal Standard
**MCP** acts like a "USB port" for AI applications. It standardizes how AI models discover and use external tools.
-   **MCP Server**: A lightweight program that says "Here are the tools I have" (e.g., `get_stock_price`).
-   **MCP Client**: The application (like Claude Desktop or our Backend) that connects to the server and uses the tools.
-   **Transport**: How they talk. We use `stdio` (Standard Input/Output), which is fast and secure for local processes.

### 🔄 How It Works in This App

1.  **User Request**: You type *"What is the price of AAPL?"* in the Frontend.
2.  **Intent Detection**: The Backend receives the message. In a full AI app, an LLM would analyze this. Here, we use simple logic to detect the stock ticker.
3.  **Tool Call (MCP)**:
    -   The Backend (acting as **MCP Client**) sends a JSON-RPC request to the running **MCP Server** process.
    -   Request: `call_tool("get_stock_price", { ticker: "AAPL" })`
4.  **Execution**:
    -   The **MCP Server** receives the request.
    -   It uses `yahoo-finance2` to fetch the live price from the internet.
    -   It returns the result: `"Price of AAPL: 278.57 USD"`.
5.  **Response**: The Backend sends this data back to the Frontend to display.

This architecture decouples the "Brain" (AI/Client) from the "Hands" (Tools/Server), making it easy to swap or add new capabilities without rewriting the core application.

## 🛠️ Technology Stack

### 1. MCP Server (`mcp-server`)
The "Tool Provider".
-   **Node.js & TypeScript**: Runtime and language.
-   **@modelcontextprotocol/sdk**: The official SDK to define servers and tools.
-   **yahoo-finance2**: A library to scrape real-time stock data from Yahoo Finance.

### 2. Backend (`web-app/server`)
The "MCP Client" and API layer.
-   **Express**: Web server to handle frontend requests.
-   **@modelcontextprotocol/sdk**: Used here as a *Client* to connect to the MCP Server.
-   **Stdio Transport**: Connects to the local MCP server process securely without network ports.

### 3. Frontend (`web-app/client`)
The User Interface.
-   **React (Vite)**: Fast, modern web framework.
-   **TailwindCSS v4**: Utility-first CSS framework for styling.
-   **Design**: Dark mode, glassmorphism effects, and responsive layout.

## 🏃‍♂️ How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build All Packages**:
    ```bash
    npm run build -w mcp-server
    npm run build -w web-app/server
    npm run build -w web-app/client
    ```

3.  **Start Backend**:
    ```bash
    cd web-app/server
    npm start
    ```

4.  **Start Frontend**:
    ```bash
    cd web-app/client
    npm run dev
    ```

5.  **Use the App**:
    Open the frontend URL (usually `http://localhost:5173`), type "What is the price of NVDA?", and watch the system fetch live data!
