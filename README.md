# @pipeworx/clash-royale

[Clash Royale API](https://developer.clashroyale.com/) MCP — player + clan + battle data. Free dev key.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Auth

- Platform: `PLATFORM_CLASHROYALE_KEY`. BYO: `?_apiKey=…`.
- **Caveat:** Supercell keys are IP-bound. CF Workers use dynamic egress IPs — generate your key with "Allow any IP" or it will 403.

## Tools

- `player(tag)` — player profile
- `player_battles(tag)` — recent battles
- `player_upcoming_chests(tag)` — upcoming chest cycle
- `clan(tag)` — clan profile
- `clan_members(tag, limit?, after?, before?)` — clan members
- `clan_war_log(tag, limit?, after?, before?)` — war log
- `clan_current_war(tag)` — current war
- `clan_search(name?, locationId?, minMembers?, maxMembers?, minScore?, limit?, after?, before?)` — clan search
- `tournament(tag)` — tournament info
- `tournament_search(name?, limit?, after?, before?)` — search tournaments
- `cards()` — card list
- `locations()` — locations
- `location(id)` — location detail
- `rankings_clans(locationId, limit?)` — top clans for location
- `rankings_players(locationId, limit?)` — top players for location

`tag` example: `#2PP` (no `#` in URL — pack URL-encodes it).

## Data source

`https://api.clashroyale.com/v1`

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "clash-royale": {
      "url": "https://gateway.pipeworx.io/clash-royale/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Clash Royale data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
