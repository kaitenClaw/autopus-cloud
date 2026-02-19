
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const AGENTS = [
    { name: 'Forge', profile: 'forge', model: 'claude-3-5-sonnet-20241022', role: 'Builder & Coder' },
    { name: 'Sight', profile: 'sight', model: 'gemini-2.0-pro-exp-0211', role: 'Researcher & Analyst' },
    { name: 'Pulse', profile: 'pulse', model: 'gemini-2.0-flash-thinking-exp-01-21', role: 'Project Manager' },
    { name: 'Prime', profile: 'prime', model: 'gpt-4o', role: 'Executive Controller' },
    { name: 'Fion', profile: 'fion', model: 'gemini-2.0-flash-exp', role: 'Finance & Operations' }
];

async function main() {
    const adminEmail = 'altoncheng.research@gmail.com';
    const user = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!user) {
        console.error('Admin user not found. Run create_admin.js first.');
        return;
    }

    console.log(`Seeding agents for ${user.email} (${user.id})...`);

    for (const agent of AGENTS) {
        const existing = await prisma.agent.findFirst({
            where: { userId: user.id, name: agent.name }
        });

        if (!existing) {
            await prisma.agent.create({
                data: {
                    userId: user.id,
                    name: agent.name,
                    modelPreset: agent.model, // Required field
                    status: 'STOPPED', // Initial status
                    agentConfig: {
                        create: {
                            model: agent.model,
                            systemPrompt: `You are ${agent.name}, a ${agent.role} agent.`
                        }
                    }
                }
            });
            console.log(`Created agent: ${agent.name}`);
        } else {
            console.log(`Agent exists: ${agent.name}`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
