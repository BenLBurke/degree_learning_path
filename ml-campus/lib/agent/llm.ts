/**
 * LLM abstraction with two backends:
 *  - Anthropic SDK   — used when a valid ANTHROPIC_API_KEY is present
 *  - Claude CLI       — local-dev fallback that shells out to `claude -p`,
 *                       reusing your Claude Code subscription auth (no API key)
 *
 * The CLI backend is intended for LOCAL DEVELOPMENT ONLY. It spawns the
 * `claude` binary that must be installed and logged in on the machine running
 * the Next.js server. Do not use it in production.
 */
import Anthropic from '@anthropic-ai/sdk';
import { spawn } from 'child_process';

export type LLMMessage = { role: 'user' | 'assistant'; content: string };

export interface LLMOptions {
  system?: string;
  messages: LLMMessage[];
  model?: string;
  maxTokens?: number;
}

const apiKey = process.env.ANTHROPIC_API_KEY;
const hasValidKey = !!apiKey && apiKey.startsWith('sk-ant-');

// Force CLI backend with LLM_BACKEND=claude-cli even if a key exists.
const forceCli = process.env.LLM_BACKEND === 'claude-cli';

export const usingCliBackend = forceCli || !hasValidKey;

const DEFAULT_MODEL = 'claude-sonnet-4-6';

// Map full model ids to Claude CLI aliases.
function cliModel(model?: string): string {
  const m = model ?? DEFAULT_MODEL;
  if (m.includes('sonnet')) return 'sonnet';
  if (m.includes('opus')) return 'opus';
  if (m.includes('haiku')) return 'haiku';
  return m;
}

function flattenConversation(messages: LLMMessage[]): string {
  return messages
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');
}

/** Run the `claude` CLI in print mode and return the full text response. */
function claudeCli(opts: LLMOptions): Promise<string> {
  const prompt = flattenConversation(opts.messages);
  const args = ['-p', '--model', cliModel(opts.model)];
  if (opts.system) args.push('--append-system-prompt', opts.system);

  return new Promise((resolve, reject) => {
    const child = spawn('claude', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d.toString()));
    child.stderr.on('data', (d) => (err += d.toString()));
    child.on('error', (e) =>
      reject(new Error(`Failed to spawn 'claude' CLI: ${e.message}. Is Claude Code installed and on PATH?`))
    );
    child.on('close', (code) =>
      code === 0 ? resolve(out.trim()) : reject(new Error(err.trim() || `claude exited with code ${code}`))
    );
    child.stdin.write(prompt);
    child.stdin.end();
  });
}

/** Non-streaming completion. */
export async function completeText(opts: LLMOptions): Promise<string> {
  if (!usingCliBackend) {
    const anthropic = new Anthropic();
    const msg = await anthropic.messages.create({
      model: opts.model ?? DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 1000,
      ...(opts.system ? { system: opts.system } : {}),
      messages: opts.messages,
    });
    return msg.content[0]?.type === 'text' ? msg.content[0].text : '';
  }
  return claudeCli(opts);
}

/** Streaming completion — yields text chunks. */
export async function* streamText(opts: LLMOptions): AsyncGenerator<string> {
  if (!usingCliBackend) {
    const anthropic = new Anthropic();
    const stream = await anthropic.messages.stream({
      model: opts.model ?? DEFAULT_MODEL,
      max_tokens: opts.maxTokens ?? 1500,
      ...(opts.system ? { system: opts.system } : {}),
      messages: opts.messages,
    });
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
    return;
  }

  // CLI backend: no token streaming, so emit the full response in word-sized
  // chunks to preserve the streaming UX.
  const full = await claudeCli(opts);
  for (const token of full.split(/(\s+)/)) {
    if (token) yield token;
  }
}
