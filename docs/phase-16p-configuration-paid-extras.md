# Phase 16P — Configuration Paid Extras Cleanup

Customer and booster order workspaces now share one configuration summary.

Configuration shows only:
- Current Rank
- Desired Rank
- their existing Rocket League rank badges
- Paid Extras that produced an actual positive charge in price_breakdown

Paid extra labels currently recognized:
- Play With Booster
- Live Stream
- Express / Express Delivery
- Rank Insurance

Not shown:
- false/no extras
- Appear Offline when free
- platform
- playlist
- boost method as a generic configuration row
- any other raw configuration key

The price breakdown remains unchanged for the customer and stays authoritative.
No pricing or DB logic changed.
