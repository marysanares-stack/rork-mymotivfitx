// Lightweight local stub to replace the private @rork/toolkit-sdk during builds
// Provides minimal APIs used by the app: generateText, createRorkTool, useRorkAgent

import { useEffect, useMemo, useRef, useState } from 'react';

// --- generateText ---------------------------------------------------------
type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string };

export async function generateText(opts: { messages: ChatMessage[] }): Promise<string> {
  // Very simple local generator: choose a short motivational phrase
  const fallbacks = [
    'Small steps, big changes.',
    'Energy follows action.',
    'Consistency beats intensity.',
    'Progress over perfection.',
    'One more rep. One more day.',
    'Strong mind. Strong body.',
    'Your pace. Your race.',
    'Motion creates emotion.',
  ];
  // Simple seed by last message length
  const last = opts.messages?.[opts.messages.length - 1]?.content ?? '';
  const idx = Math.abs(hashCode(last)) % fallbacks.length;
  return fallbacks[idx];
}

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}

// --- createRorkTool ------------------------------------------------------
export type RorkTool<TInput = any, TOutput = any> = {
  description: string;
  zodSchema: any; // kept untyped to avoid zod peer dep coupling
  execute: (input: TInput) => Promise<TOutput> | TOutput;
};

export function createRorkTool<TInput, TOutput>(tool: RorkTool<TInput, TOutput>): RorkTool<TInput, TOutput> {
  return tool;
}

// --- useRorkAgent --------------------------------------------------------
type ToolPart = {
  type: 'tool';
  toolName: string;
  state: 'input-available' | 'input-streaming' | 'output-available' | 'output-error';
  output?: any;
  errorText?: string;
};

type TextPart = { type: 'text'; text: string };

type AgentMessage = {
  id: string;
  role: 'user' | 'assistant';
  parts: (TextPart | ToolPart)[];
};

type UseRorkAgentOptions = {
  tools: Record<string, RorkTool<any, any>>;
};

type UseRorkAgentReturn = {
  messages: AgentMessage[];
  status: '' | 'responding';
  error?: string;
  sendMessage: (text: string) => void;
};

export function useRorkAgent(opts: UseRorkAgentOptions): UseRorkAgentReturn {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [status, setStatus] = useState<'' | 'responding'>('');
  const [error, setError] = useState<string | undefined>(undefined);
  const toolsRef = useRef(opts.tools);

  useEffect(() => {
    toolsRef.current = opts.tools;
  }, [opts.tools]);

  const sendMessage = (text: string) => {
    const id = genId();
    setMessages((prev) => [
      ...prev,
      { id: `u-${id}`, role: 'user', parts: [{ type: 'text', text }] },
    ]);
    setStatus('responding');
    setError(undefined);

    // Very basic heuristic response
    const lower = text.toLowerCase();
    const willUseTool = lower.includes('plan') && toolsRef.current && toolsRef.current['createWorkoutPlan'];

    if (willUseTool) {
      // Simulate a tool call lifecycle
      const toolName = 'createWorkoutPlan';
      const tool = toolsRef.current[toolName];

      // 1) Show tool input phase
      const msgId = genId();
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${msgId}`,
          role: 'assistant',
          parts: [
            { type: 'text', text: 'Creating a quick starter workout plan for you...' },
            { type: 'tool', toolName, state: 'input-available' },
          ],
        },
      ]);

      // 2) Execute tool with a minimal default input after a short delay
      setTimeout(async () => {
        try {
          const output = await tool.execute({
            name: 'Quick Start Plan',
            description: 'A simple full-body routine to get you moving.',
            difficulty: 'beginner',
            duration: 30,
            frequency: '3x per week',
            exercises: [
              { name: 'Bodyweight Squats', sets: 3, reps: 12 },
              { name: 'Push-ups', sets: 3, reps: 10 },
              { name: 'Plank', duration: 45 },
            ],
          });
          const doneId = genId();
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${doneId}`,
              role: 'assistant',
              parts: [
                { type: 'tool', toolName, state: 'output-available', output },
                { type: 'text', text: 'Plan created! You can ask for modifications anytime.' },
              ],
            },
          ]);
        } catch (e: any) {
          const errId = genId();
          setMessages((prev) => [
            ...prev,
            {
              id: `a-${errId}`,
              role: 'assistant',
              parts: [
                { type: 'tool', toolName, state: 'output-error', errorText: String(e?.message ?? e) },
              ],
            },
          ]);
          setError('Failed to run tool');
        } finally {
          setStatus('');
        }
      }, 600);
    } else {
      // Simple text response only
      setTimeout(() => {
        const msgId = genId();
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${msgId}`,
            role: 'assistant',
            parts: [
              { type: 'text', text: 'Here are some tips: focus on form, consistency, and gradual progression.' },
            ],
          },
        ]);
        setStatus('');
      }, 500);
    }
  };

  return useMemo(() => ({ messages, status, error, sendMessage }), [messages, status, error]);
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
