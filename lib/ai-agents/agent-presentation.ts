import {
  Bot,
  CalendarCheck2,
  FileInput,
  Gauge,
  type LucideIcon,
  Luggage,
  Mail,
  ReceiptText,
  ServerCog,
  ShoppingBasket,
  Sparkles,
  WalletCards,
} from "lucide-react";
import type { AgentBlueprint, AgentIconKey } from "./agent-catalog";

const agentIcons: Record<AgentIconKey, LucideIcon> = {
  bot: Bot,
  calendar: CalendarCheck2,
  data: Gauge,
  email: Mail,
  file: FileInput,
  finance: WalletCards,
  gauge: Gauge,
  prompt: Sparkles,
  receipt: ReceiptText,
  schema: ServerCog,
  shopping: ShoppingBasket,
  summary: Bot,
  travel: Luggage,
};

export function getAgentIcon(agent: Pick<AgentBlueprint, "icon">): LucideIcon {
  return agent.icon ? agentIcons[agent.icon] : Bot;
}
