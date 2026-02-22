-- Autopus Skills Seed Script
-- Run on production database to populate marketplace
-- Execute: docker exec -i ocaas-project-postgres-1 psql -U ocaas -d ocaas < skills-seed.sql

-- Create extensions if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Seed Skills
INSERT INTO "Skill" (id, slug, name, description, category, icon, version, tier, "priceUsd", featured, installs, manifest, "createdAt", "updatedAt") VALUES

-- FREE Skills
(gen_random_uuid(), 'email-ninja', 'Email Ninja', 'Intelligent email management with auto-reply, categorization, and priority filtering. Works with Gmail and Outlook.', 'productivity', '📧', '1.0.0', 'FREE', NULL, true, 0, '{
  "name": "email-ninja",
  "version": "1.0.0",
  "description": "Intelligent email management",
  "tools": ["gmail_read", "gmail_send", "outlook_read", "outlook_send"],
  "permissions": ["email:read", "email:send"],
  "config": {"autoReply": true, "categorize": true}
}', NOW(), NOW()),

(gen_random_uuid(), 'calendar-sage', 'Calendar Sage', 'Smart scheduling assistant that finds optimal meeting times, sends invites, and manages conflicts.', 'productivity', '📅', '1.0.0', 'FREE', NULL, true, 0, '{
  "name": "calendar-sage",
  "version": "1.0.0",
  "description": "Smart scheduling assistant",
  "tools": ["calendar_read", "calendar_write", "availability_check"],
  "permissions": ["calendar:read", "calendar:write"],
  "config": {"timezone": "auto", "buffer": 15}
}', NOW(), NOW()),

(gen_random_uuid(), 'task-master', 'Task Master', 'Project management with intelligent task prioritization, deadlines, and progress tracking.', 'productivity', '✅', '1.0.0', 'FREE', NULL, false, 0, '{
  "name": "task-master",
  "version": "1.0.0",
  "description": "Project management with intelligent prioritization",
  "tools": ["task_create", "task_update", "task_list"],
  "permissions": ["tasks:read", "tasks:write"],
  "config": {"autoPrioritize": true}
}', NOW(), NOW()),

(gen_random_uuid(), 'weather-oracle', 'Weather Oracle', 'Personal weather assistant with location-aware forecasts and smart alerts.', 'lifestyle', '🌤️', '1.0.0', 'FREE', NULL, false, 0, '{
  "name": "weather-oracle",
  "version": "1.0.0",
  "description": "Personal weather assistant",
  "tools": ["weather_current", "weather_forecast", "alerts"],
  "permissions": ["location:read"],
  "config": {"unit": "celsius"}
}', NOW(), NOW()),

-- PREMIUM Skills
(gen_random_uuid(), 'vps-guardian', 'VPS Guardian', '24/7 server monitoring with instant alerts, health dashboards, and automated recovery.', 'development', '🖥️', '1.0.0', 'PREMIUM', 5.00, true, 0, '{
  "name": "vps-guardian",
  "version": "1.0.0",
  "description": "24/7 server monitoring",
  "tools": ["server_monitor", "alert_send", "log_analyze", "auto_restart"],
  "permissions": ["server:read", "server:admin"],
  "config": {"checkInterval": 60, "autoHeal": true}
}', NOW(), NOW()),

(gen_random_uuid(), 'lead-hunter', 'Lead Hunter', 'AI-powered lead generation with data enrichment, scoring, and outreach automation.', 'sales', '🎯', '1.0.0', 'PREMIUM', 9.00, true, 0, '{
  "name": "lead-hunter",
  "version": "1.0.0",
  "description": "AI-powered lead generation",
  "tools": ["lead_search", "lead_enrich", "email_verify", "outreach_send"],
  "permissions": ["contacts:read", "contacts:write", "email:send"],
  "config": {"dailyLimit": 100, "autoEnrich": true}
}', NOW(), NOW()),

(gen_random_uuid(), 'meeting-scribe', 'Meeting Scribe', 'Real-time transcription, intelligent summaries, and action item extraction.', 'productivity', '📝', '1.0.0', 'PREMIUM', 12.00, true, 0, '{
  "name": "meeting-scribe",
  "version": "1.0.0",
  "description": "Real-time transcription and summaries",
  "tools": ["transcribe", "summarize", "action_extract", "calendar_write"],
  "permissions": ["audio:record", "calendar:write", "tasks:write"],
  "config": {"language": "auto", "summaryLength": "medium"}
}', NOW(), NOW()),

(gen_random_uuid(), 'finance-tracker', 'Finance Tracker', 'Automated expense tracking, receipt scanning, and financial reporting.', 'finance', '💰', '1.0.0', 'PREMIUM', 8.00, true, 0, '{
  "name": "finance-tracker",
  "version": "1.0.0",
  "description": "Automated expense tracking",
  "tools": ["receipt_scan", "expense_categorize", "report_generate"],
  "permissions": ["receipts:read", "finance:read", "finance:write"],
  "config": {"currency": "USD", "categories": ["office", "travel", "software"]}
}', NOW(), NOW()),

(gen_random_uuid(), 'social-pilot', 'Social Pilot', 'Social media scheduling, engagement tracking, and content optimization.', 'marketing', '📱', '1.0.0', 'PREMIUM', 7.00, false, 0, '{
  "name": "social-pilot",
  "version": "1.0.0",
  "description": "Social media management",
  "tools": ["post_schedule", "engagement_track", "analytics_report"],
  "permissions": ["social:read", "social:write"],
  "config": {"platforms": ["twitter", "linkedin"]}
}', NOW(), NOW()),

(gen_random_uuid(), 'code-reviewer', 'Code Reviewer', 'Automated code review, security scanning, and best practice suggestions.', 'development', '💻', '1.0.0', 'PREMIUM', 10.00, false, 0, '{
  "name": "code-reviewer",
  "version": "1.0.0",
  "description": "Automated code review",
  "tools": ["code_analyze", "security_scan", "pr_review"],
  "permissions": ["code:read", "repo:read"],
  "config": {"languages": ["javascript", "typescript", "python"]}
}', NOW(), NOW()),

(gen_random_uuid(), 'research-assistant', 'Research Assistant', 'Deep web research with source verification and comprehensive summaries.', 'productivity', '🔬', '1.0.0', 'PREMIUM', 6.00, false, 0, '{
  "name": "research-assistant",
  "version": "1.0.0",
  "description": "Deep web research",
  "tools": ["web_search", "source_verify", "summarize", "citation_generate"],
  "permissions": ["web:read", "storage:write"],
  "config": {"verifySources": true, "maxSources": 10}
}', NOW(), NOW()),

(gen_random_uuid(), 'document-analyst', 'Document Analyst', 'Document parsing, data extraction, and intelligent Q&A over files.', 'productivity', '📄', '1.0.0', 'PREMIUM', 8.00, false, 0, '{
  "name": "document-analyst",
  "version": "1.0.0",
  "description": "Document parsing and analysis",
  "tools": ["document_parse", "data_extract", "qa_answer"],
  "permissions": ["files:read", "storage:write"],
  "config": {"formats": ["pdf", "docx", "xlsx"], "ocr": true}
}', NOW(), NOW());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_skill_category" ON "Skill"(category);
CREATE INDEX IF NOT EXISTS "idx_skill_tier" ON "Skill"(tier);
CREATE INDEX IF NOT EXISTS "idx_skill_featured" ON "Skill"(featured);

-- Verify insert
SELECT COUNT(*) as skill_count FROM "Skill";
SELECT slug, name, tier, "priceUsd" FROM "Skill" ORDER BY tier, name;
