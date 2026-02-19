
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

const prisma = new PrismaClient();

const HOME_DIR = process.env.OPENCLAW_HOME || os.homedir();

async function main() {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected.');

    const userId = 'user-123'; // Replace with actual user ID if known, or fetch first user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No user found');
        return;
    }
    console.log(`Using user: ${user.id} (${user.email})`);

    console.log('Testing getFeed query...');
    const start = Date.now();
    try {
        const limit = 80;
        const messages = await prisma.message.findMany({
            where: {
                agent: { userId: user.id, deletedAt: null }
            },
            orderBy: { createdAt: 'desc' },
            take: limit + 1,
            include: {
                agent: { select: { id: true, name: true } },
                session: { select: { id: true, title: true } },
            },
        });
        const duration = Date.now() - start;
        console.log(`Query took ${duration}ms. Messages found: ${messages.length}`);
    } catch (e) {
        console.error('Query failed:', e);
    }

    // Check file paths for getOpenClawThreads
    console.log('\nChecking file paths for OpenClaw profiles...');
    const profiles = ['forge', 'sight', 'pulse', 'prime', 'fion'];
    for (const p of profiles) {
        const pPath = path.join(HOME_DIR, `.openclaw-${p === 'prime' ? '' : p}`); // prime is .openclaw
        const realPath = p === 'prime' ? path.join(HOME_DIR, '.openclaw') : pPath;

        console.log(`Checking profile ${p} at ${realPath}...`);
        try {
            await fs.access(realPath);
            console.log(`  Directory exists.`);

            const sessionsPath = path.join(realPath, 'sessions/sessions.json');
            const altSessionsPath = path.join(realPath, 'agents/main/sessions/sessions.json');

            let found = false;
            try {
                await fs.access(sessionsPath);
                const stats = await fs.stat(sessionsPath);
                console.log(`  Found sessions.json at ${sessionsPath} (${stats.size} bytes)`);
                found = true;
            } catch { }

            if (!found) {
                try {
                    await fs.access(altSessionsPath);
                    const stats = await fs.stat(altSessionsPath);
                    console.log(`  Found sessions.json at ${altSessionsPath} (${stats.size} bytes)`);
                    found = true;
                } catch { }
            }

            if (!found) {
                console.log(`  No sessions.json found.`);
            }

        } catch {
            console.log(`  Directory does NOT exist.`);
        }
    }

    await prisma.$disconnect();
}

main().catch(console.error);
