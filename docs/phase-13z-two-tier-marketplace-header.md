# Phase 13Z — Two-tier Marketplace Header

Redesigns the marketing header into a two-level marketplace navigation.

## Desktop
Top row:
- BoostingPedia logo
- Explore games selector
- existing primary navigation
- account controls

Second row:
- all 7 launch games
- Rocket League remains clickable / Available
- other launch games remain muted / In development

## Authenticated state
Replaces the standalone Dashboard button with:
- notification control
- circular account avatar using real initials
- Menu dropdown

Menu uses existing routes:
- Dashboard
- My Orders
- Profile
- Notifications

The current identity does not expose an avatar image URL, so initials are used instead of inventing a profile picture.

## Mobile/tablet
- compact top row
- horizontally scrollable game strip
- same account Menu behavior

## Unchanged
- auth logic
- notification count behavior
- Home content
- hero
- sections
- game availability
