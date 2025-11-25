import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendPath = path.resolve(__dirname, '../web-app/server');

async function runTest() {
    console.log('Starting Backend Server...');

    // Start the backend server
    const serverProcess = spawn('npm', ['start'], {
        cwd: backendPath,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
    });

    let serverUrl = '';

    // Wait for server to start
    await new Promise<void>((resolve, reject) => {
        serverProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(`[Server]: ${output.trim()}`);
            if (output.includes('Backend running on')) {
                serverUrl = 'http://localhost:3000';
                resolve();
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(`[Server Error]: ${data.toString()}`);
        });

        serverProcess.on('error', (err) => {
            reject(err);
        });

        // Timeout after 10 seconds
        setTimeout(() => reject(new Error('Server start timeout')), 10000);
    });

    console.log('Backend started. Running test request...');

    try {
        const response = await fetch(`${serverUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: "What is the price of AAPL?" })
        });

        const data = await response.json();
        console.log('Response:', data);

        if (data.reply && data.reply.includes('Price of AAPL')) {
            console.log('✅ Test Passed: Received stock price.');
        } else {
            console.error('❌ Test Failed: Unexpected response format.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Test Failed:', error);
        process.exit(1);
    } finally {
        console.log('Stopping server...');
        serverProcess.kill();
        // Force kill if needed
        try { process.kill(-serverProcess.pid!); } catch (e) { }
    }
}

runTest();
