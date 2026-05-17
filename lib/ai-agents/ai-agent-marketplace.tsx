import {
  Bot,
  Cpu,
  FileInput,
  Gauge,
  type LucideIcon,
  Mail,
  MonitorCheck,
  ServerCog,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { cn } from "~/lib/utils";
import {
  type AgentBlueprint,
  type AgentRuntime,
  agentBlueprints,
  getRuntimeLayer,
} from "./agent-catalog";
import { AgentRuntimeStatus } from "./ai-agent-runtime-status";

const runtimeIcons: Record<AgentRuntime, LucideIcon> = {
  "browser-ai": MonitorCheck,
  hybrid: Gauge,
  "local-model": Cpu,
  "server-agent": ServerCog,
};

const agentIcons: Record<string, LucideIcon> = {
  "data-cleaner": Gauge,
  "email-digest": Mail,
  "file-to-data": FileInput,
  "json-schema": ServerCog,
  "private-summarizer": Bot,
  "prompt-builder": Sparkles,
};

export function AiAgentMarketplace({
  compact = false,
}: {
  compact?: boolean;
}): ReactNode {
  return (
    <section
      className={cn(
        "border-y border-border/70",
        compact ? "bg-muted/20 py-14 md:py-20" : "bg-background py-10 md:py-12",
      )}
      id="ai-agents"
    >
      <div className="container mx-auto flex max-w-7xl flex-col gap-7 px-4">
        {compact ? (
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Free AI agents
              </p>
              <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
                Use small agents for real work.
              </h2>
            </div>
            <Button asChild className="w-fit rounded-lg">
              <Link href="/ai-agents">Open agents</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Agent shelf
              </p>
              <p className="mt-2 max-w-2xl text-muted-foreground text-sm leading-6">
                Pick one job. Run it. Copy the result.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 md:items-end">
              <AgentRuntimeStatus />
            </div>
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {agentBlueprints.map((agent) => (
            <AgentCard agent={agent} key={agent.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentCard({ agent }: { agent: AgentBlueprint }): ReactNode {
  const runtime = getRuntimeLayer(agent.runtime);
  const RuntimeIcon = runtimeIcons[agent.runtime];
  const AgentIcon = agentIcons[agent.id] ?? Bot;

  return (
    <Card
      className="rounded-lg py-4 transition-colors hover:border-foreground/25"
      id={`agent-${agent.id}`}
    >
      <CardHeader className="gap-3 px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/35">
              <AgentIcon className="size-5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <CardTitle className="truncate text-xl font-black">
                {agent.name}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-2 text-sm leading-6">
                {agent.tagline}
              </CardDescription>
            </div>
          </div>
          <Button asChild className="shrink-0 rounded-lg" size="sm">
            <Link href={`/ai-agents/${agent.id}`}>Run</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 px-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-lg">
            <RuntimeIcon />
            {runtime.shortName}
          </Badge>
          <Badge variant="secondary" className="rounded-lg">
            {agent.privacy}
          </Badge>
        </div>

        <div className="grid gap-2 border-t pt-4 text-sm sm:grid-cols-2">
          <MiniField label="Input" values={agent.inputs} />
          <MiniField label="Output" values={agent.outputs.slice(0, 3)} />
        </div>
      </CardContent>
    </Card>
  );
}

function MiniField({
  label,
  values,
}: {
  label: string;
  values: string[];
}): ReactNode {
  return (
    <div className="min-w-0">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 truncate capitalize text-foreground/85">
        {values.join(", ")}
      </p>
    </div>
  );
}
