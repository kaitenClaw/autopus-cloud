import fs from 'fs/promises';
import path from 'path';
import os from 'os';

export interface AgentProfileConfig {
  agentId: string;
  modelPrimary: string;
  telegramToken?: string;
  allowedUserIds: string[];
  systemPrompt?: string;
}

export class ProfileGenerator {
  private readonly baseDir = path.join(os.homedir(), '.ocaas-agents');

  async generate(config: AgentProfileConfig): Promise<string> {
    const profileDir = path.join(this.baseDir, `customer-${config.agentId}`);
    const agentDataDir = path.join(profileDir, 'agents', 'main', 'agent');

    // Create directories
    await fs.mkdir(agentDataDir, { recursive: true });
    await fs.mkdir(path.join(profileDir, 'logs'), { recursive: true });

    // 1. Generate openclaw.json
    const openClawConfig = {
      agents: {
        defaults: {
          model: {
            primary: config.modelPrimary,
            fallbacks: ["google/gemini-2.0-flash"]
          }
        }
      },
      channels: {
        telegram: {
          enabled: !!config.telegramToken,
          token: config.telegramToken,
          allowFrom: config.allowedUserIds
        }
      }
    };

    await fs.writeFile(
      path.join(profileDir, 'openclaw.json'),
      JSON.stringify(openClawConfig, null, 2)
    );

    // 2. Generate system-prompt.md
    if (config.systemPrompt) {
      await fs.writeFile(
        path.join(agentDataDir, 'system-prompt.md'),
        config.systemPrompt
      );
    }

    return profileDir;
  }

  async delete(agentId: string): Promise<void> {
    const profileDir = path.join(this.baseDir, `customer-${agentId}`);
    await fs.rm(profileDir, { recursive: true, force: true });
  }
}

export const profileGenerator = new ProfileGenerator();
