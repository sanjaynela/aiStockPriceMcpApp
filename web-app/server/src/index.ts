import express from 'express';
import cors from 'cors';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Path to the MCP server build
const mcpServerPath = path.resolve(__dirname, '../../../mcp-server/build/index.js');

// Initialize MCP Client
const transport = new StdioClientTransport({
    command: "node",
    args: [mcpServerPath],
});

const client = new Client(
    {
        name: "stock-web-client",
        version: "1.0.0",
    },
    {
        capabilities: {},
    }
);

async function startMcpClient() {
    try {
        await client.connect(transport);
        console.log("Connected to MCP Server");

        // List tools to verify connection
        const tools = await client.listTools();
        console.log("Available tools:", tools.tools.map(t => t.name));
    } catch (error) {
        console.error("Failed to connect to MCP Server:", error);
    }
}

startMcpClient();

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    console.log("Received message:", message);

    // Simple "AI" logic: Extract ticker from message
    // Regex to find 1-5 uppercase letters
    const tickerMatch = message.match(/\b[A-Z]{1,5}\b/);

    if (tickerMatch) {
        const ticker = tickerMatch[0];
        console.log(`Detected ticker: ${ticker}, calling MCP tool...`);

        try {
            const result = await client.callTool({
                name: "get_stock_price",
                arguments: { ticker },
            });

            // @ts-ignore
            const textContent = result.content[0].text;
            res.json({ reply: textContent });
        } catch (error) {
            console.error("Error calling tool:", error);
            res.status(500).json({ error: "Failed to fetch stock price" });
        }
    } else {
        res.json({ reply: "I didn't see a stock ticker in your message. Try asking about AAPL or NVDA." });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
