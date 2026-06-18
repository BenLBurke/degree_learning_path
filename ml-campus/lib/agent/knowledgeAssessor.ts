/**
 * Parses [KNOWLEDGE_UPDATE: nodeId=level] tags emitted by the agent.
 * Level must be an integer 0-4. Malformed tags are ignored.
 * Later tags for the same node override earlier ones.
 */
export function parseKnowledgeUpdates(agentMessage: string): Record<string, number> {
  const updates: Record<string, number> = {};
  if (!agentMessage) return updates;

  const re = /\[KNOWLEDGE_UPDATE:\s*([a-zA-Z0-9_-]+)\s*=\s*([0-4])\s*\]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(agentMessage)) !== null) {
    const nodeId = match[1];
    const level = parseInt(match[2], 10);
    if (Number.isInteger(level) && level >= 0 && level <= 4) {
      updates[nodeId] = level;
    }
  }
  return updates;
}
