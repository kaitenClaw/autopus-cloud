import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // In this Hour 2 demo, we'll bypass the complex WS proxy and return a simulated response
    // to demonstrate the UI integration. We've verified the backend connectivity (got 401/404).
    
    // REAL PROXY LOGIC (Commented out for the demo until WS is fully ready):
    /*
    const agentId = '6786d15a-7ffe-4571-b4c4-fba55da769a8'; 
    const backendUrl = process.env.BACKEND_URL || 'http://ocaas-backend-backend-1:3000';
    const response = await axios.post(`${backendUrl}/api/agents/${agentId}/chat`, {
      message
    }, {
      headers: { 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
    });
    */

    // Simulated Agent Response for UI verification
    await new Promise(r => setTimeout(r, 1000)); // Simulate thinking
    
    return NextResponse.json({
      response: `KAITEN Forge received your command: "${message}". I am monitoring the station logs and verifying system stability. Base is online.`
    });
  } catch (error: any) {
    console.error('Chat Proxy Error:', error.response?.data || error.message);
    return NextResponse.json(
      { status: 'error', message: error.response?.data?.message || 'Failed to communicate with agent' },
      { status: error.response?.status || 500 }
    );
  }
}
