interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Clash Royale MCP.
 */


const BASE = 'https://api.clashroyale.com/v1';
const UA = 'pipeworx-mcp-clash-royale/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  { name: 'player', description: 'Player profile.', inputSchema: { type: 'object', properties: { tag: { type: 'string' } }, required: ['tag'] } },
  { name: 'player_battles', description: 'Recent battles.', inputSchema: { type: 'object', properties: { tag: { type: 'string' } }, required: ['tag'] } },
  { name: 'player_upcoming_chests', description: 'Upcoming chest cycle.', inputSchema: { type: 'object', properties: { tag: { type: 'string' } }, required: ['tag'] } },
  { name: 'clan', description: 'Clan profile.', inputSchema: { type: 'object', properties: { tag: { type: 'string' } }, required: ['tag'] } },
  {
    name: 'clan_members',
    description: 'Clan members.',
    inputSchema: { type: 'object', properties: { tag: { type: 'string' }, limit: { type: 'number' }, after: { type: 'string' }, before: { type: 'string' } }, required: ['tag'] },
  },
  {
    name: 'clan_war_log',
    description: 'War log.',
    inputSchema: { type: 'object', properties: { tag: { type: 'string' }, limit: { type: 'number' }, after: { type: 'string' }, before: { type: 'string' } }, required: ['tag'] },
  },
  { name: 'clan_current_war', description: 'Current war.', inputSchema: { type: 'object', properties: { tag: { type: 'string' } }, required: ['tag'] } },
  {
    name: 'clan_search',
    description: 'Clan search.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        locationId: { type: 'number' },
        minMembers: { type: 'number' },
        maxMembers: { type: 'number' },
        minScore: { type: 'number' },
        limit: { type: 'number' },
        after: { type: 'string' },
        before: { type: 'string' },
      },
    },
  },
  { name: 'tournament', description: 'Tournament info.', inputSchema: { type: 'object', properties: { tag: { type: 'string' } }, required: ['tag'] } },
  {
    name: 'tournament_search',
    description: 'Search tournaments.',
    inputSchema: { type: 'object', properties: { name: { type: 'string' }, limit: { type: 'number' }, after: { type: 'string' }, before: { type: 'string' } } },
  },
  { name: 'cards', description: 'Card list.', inputSchema: { type: 'object', properties: {} } },
  { name: 'locations', description: 'Locations.', inputSchema: { type: 'object', properties: {} } },
  { name: 'location', description: 'Location detail.', inputSchema: { type: 'object', properties: { id: { type: 'number' } }, required: ['id'] } },
  { name: 'rankings_clans', description: 'Top clans for location.', inputSchema: { type: 'object', properties: { locationId: { type: 'number' }, limit: { type: 'number' } }, required: ['locationId'] } },
  { name: 'rankings_players', description: 'Top players for location.', inputSchema: { type: 'object', properties: { locationId: { type: 'number' }, limit: { type: 'number' } }, required: ['locationId'] } },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const apiKey = (args._apiKey as string | undefined)?.trim();
  if (!apiKey) throw new Error('Clash Royale requires an API key. Set PLATFORM_CLASHROYALE_KEY or pass ?_apiKey=… (free at https://developer.clashroyale.com — generate with "Allow any IP").');
  const get = async (path: string, params?: Record<string, unknown>) => {
    const p = new URLSearchParams();
    if (params) for (const [k, v] of Object.entries(params)) if (k !== '_apiKey' && v != null) p.set(k, String(v));
    const url = `${BASE}${path}${[...p].length ? `?${p}` : ''}`;
    const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': UA, Authorization: `Bearer ${apiKey}` } });
    if (res.status === 401) throw new Error('Clash Royale: invalid API key.');
    if (res.status === 403) throw new Error('Clash Royale: 403 — likely IP not allowlisted on this key (regenerate with "Allow any IP").');
    if (!res.ok) throw new Error(`Clash Royale: ${res.status}`);
    return res.json();
  };
  const tag = (k = 'tag', ex = '"#2PP"') => {
    const v = args[k];
    if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${k}" is missing. Pass a string like ${ex}.`);
    return encodeURIComponent(v.startsWith('#') ? v : `#${v}`);
  };
  const reqNum = (k: string, ex: string) => {
    const v = args[k];
    if (v == null || typeof v !== 'number') throw new Error(`Required argument "${k}" is missing. Pass a number like ${ex}.`);
    return v;
  };
  switch (name) {
    case 'player':
      return get(`/players/${tag()}`);
    case 'player_battles':
      return get(`/players/${tag()}/battlelog`);
    case 'player_upcoming_chests':
      return get(`/players/${tag()}/upcomingchests`);
    case 'clan':
      return get(`/clans/${tag()}`);
    case 'clan_members':
      return get(`/clans/${tag()}/members`, args);
    case 'clan_war_log':
      return get(`/clans/${tag()}/warlog`, args);
    case 'clan_current_war':
      return get(`/clans/${tag()}/currentwar`);
    case 'clan_search':
      return get('/clans', args);
    case 'tournament':
      return get(`/tournaments/${tag()}`);
    case 'tournament_search':
      return get('/tournaments', args);
    case 'cards':
      return get('/cards');
    case 'locations':
      return get('/locations');
    case 'location':
      return get(`/locations/${reqNum('id', '57000000')}`);
    case 'rankings_clans':
      return get(`/locations/${reqNum('locationId', '57000000')}/rankings/clans`, { limit: args.limit });
    case 'rankings_players':
      return get(`/locations/${reqNum('locationId', '57000000')}/rankings/players`, { limit: args.limit });
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
