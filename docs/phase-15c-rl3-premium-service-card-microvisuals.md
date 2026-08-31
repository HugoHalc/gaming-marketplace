# Phase 15C — RL-3 Premium Service Card Microvisuals

Scope: the five service catalog cards on `/games/rocket-league` only.

## Microvisuals
1. Rank Boost
   - Real project assets:
     - Diamond
     - Champion
     - Grand Champion
   - Three compact badges with neutral arrows.
   - Represents current → target progression.

2. Competitive Wins
   - `+1` in Rajdhani.
   - Small abstract win-progress markers.
   - Does not represent user data.

3. Tournament Boost
   - Minimal bracket made from lines and nodes.
   - Small blue contextual final node.

4. Rewards Boost
   - `SEASON REWARDS` in Rajdhani.
   - Thin segmented progression bar.
   - No numeric value to avoid implying real user progress.

5. Placements Boost
   - `PLACEMENTS` in Rajdhani.
   - Ten abstract placement slots.
   - No numeric completion value.

## Color system
For Rocket League cards only:
- top haze changes from green to `blue-400/[0.05]`
- microvisual context uses subtle Rocket League blue
- BoostingPedia green remains in action/CTA hover

## Layout
- Existing card dimensions remain unchanged.
- Existing label, number, title, description, pricing and CTA are preserved.
- Microvisual height remains under ~70px.
- Title spacing and footer padding are tightened slightly to absorb the new visual without increasing card size.

## Motion
- 200ms opacity/contrast changes only.
- no scale
- no glow
- no looping animation
- reduced-motion respected

Other game storefront cards retain their existing treatment.
