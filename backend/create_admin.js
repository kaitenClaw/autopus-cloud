
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const email = 'altoncheng.research@gmail.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            passwordHash: hashedPassword,
            name: 'Admin',
            role: 'ADMIN',
            subscription: {
                create: {
                    tier: 'PRO',
                    maxAgents: 10,
                    maxTokensPerDay: 100000
                }
            }
        }
    });
    console.log('Created admin user:', user.email);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
