import { PrismaClient } from '@prisma/client';
import os from 'os';
import { readFile } from 'fs/promises';

const prisma = new PrismaClient();
const OPENCLAW_HOME = process.env.OPENCLAW_HOME || `${os.homedir()}/.openclaw`;

async function verifyConsistency() {
  console.log('--- Usage Pipeline Consistency Check ---');

  try {
    // 1. Check DB Connectivity
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database: Connected');

    // 2. Check Usage Records
    const totalRecords = await prisma.usage.count();
    const recentRecords = await prisma.usage.count({
      where: {
        timestamp: { gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
      }
    });
    console.log(`📊 Usage Table: ${totalRecords} total records (${recentRecords} in the last hour)`);

    // 3. Verify Session Sync (Check if there are messages without usage or vice versa)
    // This is a simplified check: comparing counts
    const totalMessages = await prisma.message.count({
      where: { role: 'assistant' }
    });
    
    console.log(`💬 Total Assistant Messages: ${totalMessages}`);
    
    if (totalMessages > totalRecords) {
      console.warn(`⚠️ Warning: More assistant messages (${totalMessages}) than usage records (${totalRecords}). Potential missed events.`);
    } else {
      console.log('✅ Message vs Usage ratio looks healthy.');
    }

    // 4. Check OpenClaw Local Config for Profile presence
    try {
      const config = await readFile(`${OPENCLAW_HOME}/openclaw.json`, 'utf8');
      const parsed = JSON.parse(config);
      const profiles = Object.keys(parsed.profiles || {});
      console.log(`🤖 OpenClaw Profiles found: ${profiles.length > 0 ? profiles.join(', ') : 'default'}`);
    } catch (e) {
      console.error('❌ Could not read OpenClaw config.');
    }

  } catch (error) {
    console.error('❌ Check failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyConsistency();
