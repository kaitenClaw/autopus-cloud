import axios from 'axios';
import { NextResponse } from 'next/server';

const backendUrl = process.env.BACKEND_URL || 'http://ocaas-backend-backend-1:3000';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const { message, agentId: requestedAgentId = 'forge' } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ status: 'error', message: 'message is required' }, { status: 400 });
    }

    const agentsRes = await axios.get(`${backendUrl}/api/agents`, {
      headers: { Authorization: authHeader },
    });

    const agents = agentsRes.data?.data?.agents || [];
    const target = agents.find((agent: any) => {
      const id = String(agent?.id || '').toLowerCase();
      const name = String(agent?.name || '').toLowerCase();
      const profile = String(agent?.profile || '').toLowerCase();
      const requested = String(requestedAgentId || '').toLowerCase();

      return id === requested || name.includes(requested) || profile === requested;
    });

    if (!target?.id) {
      return NextResponse.json(
        { status: 'error', message: `No matching agent found for "${requestedAgentId}".` },
        { status: 404 }
      );
    }

    const response = await axios.post(
      `${backendUrl}/api/agents/${target.id}/message`,
      { message },
      {
        headers: { Authorization: authHeader },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Chat Proxy Error:', error.response?.data || error.message);
    return NextResponse.json(
      { status: 'error', message: error.response?.data?.message || 'Failed to communicate with agent' },
      { status: error.response?.status || 500 }
    );
  }
}
