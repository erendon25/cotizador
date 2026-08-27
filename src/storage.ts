import type { ModuleDefinition } from './domain';
import { neon } from './neon';

export interface PersistedWorkspace<TDraft> {
  draft: TDraft | null;
  modules: ModuleDefinition[] | null;
  quotes: Array<Record<string, unknown>>;
}

function requireNeon() {
  if (!neon) throw new Error('Neon no esta configurado.');
  return neon;
}

export async function loadWorkspace<TDraft>(): Promise<PersistedWorkspace<TDraft>> {
  const client = requireNeon();
  const [statesResult, quotesResult] = await Promise.all([
    client.from('workspace_states').select('state_key, payload'),
    client.from('quote_versions').select('snapshot').order('created_at', { ascending: true }),
  ]);

  if (statesResult.error) throw new Error(statesResult.error.message);
  if (quotesResult.error) throw new Error(quotesResult.error.message);

  const states = (statesResult.data ?? []) as Array<{ state_key: string; payload: unknown }>;
  const state = new Map(states.map((item) => [item.state_key, item.payload]));

  return {
    draft: (state.get('draft') as TDraft | undefined) ?? null,
    modules: (state.get('modules') as ModuleDefinition[] | undefined) ?? null,
    quotes: ((quotesResult.data ?? []) as Array<{ snapshot: Record<string, unknown> }>).map((row) => row.snapshot),
  };
}

export async function saveWorkspaceState(key: 'draft' | 'modules', payload: unknown) {
  const client = requireNeon();
  const existing = await client.from('workspace_states').select('id').eq('state_key', key).limit(1);
  if (existing.error) throw new Error(existing.error.message);

  const row = (existing.data as Array<{ id: string }> | null)?.[0];
  const result = row
    ? await client.from('workspace_states').update({ payload, updated_at: new Date().toISOString() }).eq('id', row.id)
    : await client.from('workspace_states').insert({ state_key: key, payload });

  if (result.error) throw new Error(result.error.message);
}

export async function saveQuoteSnapshot(snapshot: Record<string, unknown>) {
  const client = requireNeon();
  const result = await client.from('quote_versions').insert({
    quote_code: snapshot.id,
    version: Number(String(snapshot.version).replace('V', '')),
    project_name: snapshot.project,
    snapshot,
  });

  if (result.error) throw new Error(result.error.message);
}
