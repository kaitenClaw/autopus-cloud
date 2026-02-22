import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/authenticate';
import { NotFoundError } from '../utils/errors';

class SkillsController {
  /** List all skills (marketplace browse). Supports ?category= and ?featured= filters. */
  list = asyncHandler(async (req: Request, res: Response) => {
    const { category, featured, search } = req.query;

    const where: any = {};
    if (category && typeof category === 'string') where.category = category;
    if (featured === 'true') where.featured = true;
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skills = await prisma.skill.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { installs: 'desc' }, { name: 'asc' }],
    });

    res.json({ status: 'success', data: { skills } });
  });

  /** Get a single skill by slug. */
  getBySlug = asyncHandler(async (req: Request, res: Response) => {
    const slug = String(req.params.slug);
    const skill = await prisma.skill.findUnique({
      where: { slug },
    });
    if (!skill) throw new NotFoundError('Skill not found');
    res.json({ status: 'success', data: { skill } });
  });

  /** Install a skill on an agent. */
  install = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.userId;
    const slug = String(req.params.slug);
    const { agentId } = req.body;

    if (!agentId || typeof agentId !== 'string') {
      return res.status(400).json({ status: 'error', message: 'agentId is required' });
    }

    const skill = await prisma.skill.findUnique({ where: { slug } });
    if (!skill) throw new NotFoundError('Skill not found');

    const installation = await prisma.skillInstall.upsert({
      where: { skillId_agentId: { skillId: skill.id, agentId } },
      update: {},
      create: { skillId: skill.id, agentId, userId },
    });

    // Increment install counter (best-effort)
    await prisma.skill.update({
      where: { id: skill.id },
      data: { installs: { increment: 1 } },
    }).catch(() => {});

    res.json({ status: 'success', data: { installation } });
  });

  /** Uninstall a skill from an agent. */
  uninstall = asyncHandler(async (req: AuthRequest, res: Response) => {
    const slug = String(req.params.slug);
    const agentId = String(req.params.agentId);

    const skill = await prisma.skill.findUnique({ where: { slug } });
    if (!skill) throw new NotFoundError('Skill not found');

    await prisma.skillInstall.deleteMany({
      where: { skillId: skill.id, agentId },
    });

    res.json({ status: 'success', message: 'Skill uninstalled' });
  });

  /** Get all skills installed on a specific agent. */
  getInstalledForAgent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const agentId = String(req.params.agentId);

    const installations = await prisma.skillInstall.findMany({
      where: { agentId },
      include: { skill: true },
    });

    const skills = installations.map((i) => (i as any).skill);
    res.json({ status: 'success', data: { skills } });
  });
}

export const skillsController = new SkillsController();
