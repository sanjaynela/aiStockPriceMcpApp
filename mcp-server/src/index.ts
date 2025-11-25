#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import yahooFinance from 'yahoo-finance2';

// Initialize the MCP Server instance
const server = new Server(
    {
        name: "sanjay-stock-mcp",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {}, // We are telling Claude we provide executable tools
        },
    }
);

// Handle requests to list available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_stock_price",
                description: "Get the real-time price and currency of a stock ticker (e.g., NVDA, TSLA, AAPL).",
                inputSchema: {
                    type: "object",
                    properties: {
                        ticker: {
                            type: "string",
                            description: "The stock ticker symbol (e.g. AAPL)",
                        },
                    },
                    required: ["ticker"],
                },
            },
        ],
    };
});

// Handle requests to execute a tool
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_stock_price") {
        // Extract the argument provided by Claude
        const ticker = String(request.params.arguments?.ticker).toUpperCase();

        try {
            // The actual "work" - fetching live data over the internet
            const quote = await yahooFinance.quote(ticker);

            const price = quote.regularMarketPrice;
            const currency = quote.currency;
            // Format the output back to Claude as text
            return {
                content: [
                    {
                        type: "text",
                        text: `Price of ${ticker}: ${price} ${currency}`,
                    },
                ],
            };
        } catch (error) {
            // Gracefully handle errors so Claude knows what went wrong
            return {
                content: [{ type: "text", text: `Error fetching data: ${(error as Error).message}` }],
                isError: true,
            };
        }
    }
    throw new Error("Tool not found");
});

// The Connection
const transport = new StdioServerTransport();
await server.connect(transport);
