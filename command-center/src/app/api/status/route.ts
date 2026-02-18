import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real scenario, this would read status-board.json from the shared volume
    // For now, we hit the health check
    const response = await axios.get('https://api.autopus.cloud/health');
    
    return NextResponse.json({
      status: 'ok',
      system: response.data,
      agents: [
        { id: 'prime', name: 'Prime', status: 'Standby' },
        { id: 'forge', name: 'Forge', status: 'Working' },
        { id: 'sight', name: 'Sight', status: 'Auditing' },
        { id: 'pulse', name: 'Pulse', status: 'Monitoring' },
      ]
    });
  } catch (error) {
    return NextResponse.json({ status: 'error', message: 'Backend unreachable' }, { status: 502 });
  }
}
