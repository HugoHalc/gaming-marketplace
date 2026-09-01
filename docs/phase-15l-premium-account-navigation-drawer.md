# Phase 15L — Premium Account Navigation Drawer

Scope:
- authenticated header account/menu interaction only
- guest header remains Sign in only

Real routes reused:
- /dashboard
- /dashboard/orders
- /dashboard/profile
- /dashboard/notifications
- /games
- /games/rocket-league
- /boosters/rocket-league
- /#how-it-works
- /#faq
- POST /auth/signout

Not included:
- Contact support (deferred until real live chat exists)
- fake support availability
- Membership, wallet, verification, currency or language controls
- invented account/settings routes

Behavior:
- right-side fixed drawer
- dark backdrop
- click outside closes
- Escape closes
- body scroll lock
- internal drawer scroll
- closes on navigation
- focus management / keyboard loop
- reduced-motion-safe transitions
- real authenticated profile/avatar/email data
- existing logout endpoint preserved
