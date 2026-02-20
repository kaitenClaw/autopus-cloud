import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConsistency() {
  console.log('--- OCaaS Usage Consistency Check ---');
  
  // 1. Check for orphaned Usage records
  const orphanedUsage = await prisma.usage.findMany({
    where: {
      agentId: { not: null },
      agent: null
    }
  });
  console.log(`Orphaned Usage records: ${orphanedUsage.length}`);

  // 2. Aggregate usage per agent
  const agentUsage = await prisma.usage.groupBy({
    by: ['agentId'],
    _sum: {
      tokens: true,
      cost: true
    },
    where: {
      agentId: { not: null }
    }
  });

  console.log('\nUsage by Agent:');
  for (const usage of agentUsage) {
    const agent = await prisma.agent.findUnique({ where: { id: usage.agentId! } });
    console.log(`- Agent: ${agent?.name || usage.agentId} | Tokens: ${usage._sum.tokens} | Est. Cost: $${usage._sum.cost?.toFixed(4)}`);
  }

  // 3. User Daily Budget Check
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyUsage = await prisma.usage.groupBy({
    by: ['userId'],
    _sum: {
      tokens: true
    },
    where: {
      timestamp: { gte: today }
    }
  });

  console.log('\nDaily Token Consumption:');
  for (const user of dailyUsage) {
    const subscription = await prisma.subscription.findUnique({ where: { userId: user.userId } });
    const limit = subscription?.maxTokensPerDay || 10000;
    const consumed = user._sum.tokens || 0;
    const percent = (consumed / limit) * 100;
    console.log(`- User: ${user.userId} | Consumed: ${consumed}/${limit} (${percent.toFixed(1)}%)`);
    
    if (percent > 95) console.log('  ⚠️ CRITICAL: User near daily limit!');
    else if (percent > 80) console.log('  ⚠️ WARNING: User exceeded 80% of daily limit.');
  }

  await prisma.$disconnect();
}

checkConsistency().catch(console.error);
