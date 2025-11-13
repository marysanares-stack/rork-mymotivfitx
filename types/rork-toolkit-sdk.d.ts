declare module '@rork/toolkit-sdk' {
  export function generateText(opts: any): Promise<string>;
  export function useRorkAgent(opts?: any): any;
  export function createRorkTool<TInput = any, TOutput = any>(tool: any): any;
  const _default: {
    generateText: typeof generateText;
    useRorkAgent: typeof useRorkAgent;
    createRorkTool: typeof createRorkTool;
  };
  export default _default;
}
