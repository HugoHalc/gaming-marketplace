# Phase 13C — Development Game States

Rocket League is currently the only launch game shown as available.

The following games are now visibly marked **In development**:
- League of Legends
- Valorant
- Marvel Rivals
- Overwatch
- Battlefield 6
- Rainbow Six Siege

## Behavior
- Rocket League remains clickable and shows `Available`.
- In-development cards remain visible for design/layout work.
- In-development cards do not navigate customers into unfinished storefronts from Home or `/games`.
- Their underlying structural routes/files are not removed.
- No Rocket League service logic, pricing, or configurator is changed.

When a game is ready, change its `ready` flag to `true` in:
`src/features/catalog/data/launch-games.ts`
