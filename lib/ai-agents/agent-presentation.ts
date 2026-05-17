import {
  Bot,
  FileInput,
  Gauge,
  type LucideIcon,
  Mail,
  ServerCog,
  Sparkles,
} from "lucide-react";
import type { AgentBlueprint, AgentIconKey } from "./agent-catalog";

const agentIcons: Record<AgentIconKey, LucideIcon> = {
  bot: Bot,
  data: Gauge,
  email: Mail,
  file: FileInput,
  gauge: Gauge,
  prompt: Sparkles,
  schema: ServerCog,
  summary: Bot,
};

export function getAgentIcon(agent: Pick<AgentBlueprint, "icon">): LucideIcon {
  return agent.icon ? agentIcons[agent.icon] : Bot;
}
