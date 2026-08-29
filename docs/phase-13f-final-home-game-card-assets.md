# Phase 13F — Final Home Game Card Assets

This phase integrates the 7 user-approved generated game-card visuals into the Home page.

## Assets
- Rocket League
- League of Legends
- Valorant
- Marvel Rivals
- Overwatch
- Battlefield 6
- Rainbow Six Siege

All images are normalized to 1600 × 893 and stored as WebP under:
`public/game-cards/`

## Special handling
- Marvel Rivals:
  - generated visual contains no game branding
  - `Marvel Rivals` logo-style title and watermark are added in HTML/CSS
- Rainbow Six Siege:
  - generated visual includes the `SIEGE` logo
  - full `Rainbow Six Siege` watermark is added in HTML/CSS
- Valorant:
  - the baked red exterior frame is lightly cropped from the source before export

## Unchanged
- Home global layout
- grid structure
- card dimensions
- UX/navigation
- launch game states
- Rocket League services/pricing/configurators
- typography system
- all non-game-card sections
