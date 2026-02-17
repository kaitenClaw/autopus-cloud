import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

export interface AgentConfig {
  name: string;
  modelPreset: string;
  telegramBotToken?: string;
  customPrompt?: string;
  allowedUserIds?: number[];
  port: number;
}

export class ProfileGenerator {
  private static readonly BASE_DIR = path.join(os.homedir(), '.openclaw-ocaas');

  async generate(agentId: string, config: AgentConfig): Promise<string> {
    const profileDir = path.join(ProfileGenerator.BASE_DIR, `agent-${agentId}`);
    const agentDir = path.join(profileDir, 'agents', 'main', 'agent');

    await fs.mkdir(agentDir, { recursive: true });

    const openclawJson = {
      agents: {
        defaults: {
          model: {
            primary: config.modelPreset,
            fallbacks: [
              'google-antigravity/gemini-3-flash',
              'google/gemini-2.5-flash'
            ]
          }
        }
      },
      auth: {
        profiles: {
          'google-antigravity:altoncheng.research@gmail.com': {
            provider: 'google-antigravity',
            mode: 'oauth'
          }
        }
      },
      channels: {
        telegram: config.telegramBotToken ? {
          enabled: true,
          botToken: config.telegramBotToken,
          allowFrom: config.allowedUserIds || []
        } : {
          enabled: false
        }
      },
      gateway: {
        port: config.port,
        mode: 'local',
        bind: 'loopback',
        auth: {
          mode: 'none'
        }
      }
    };

    await fs.writeFile(
      path.join(profileDir, 'openclaw.json'),
      JSON.stringify(openclawJson, null, 2)
    );

    if (config.customPrompt) {
      await fs.writeFile(
        path.join(agentDir, 'system-prompt.md'),
        config.customPrompt
      );
    }

    return profileDir;
  }
}

export const profileGenerator = new ProfileGenerator();
