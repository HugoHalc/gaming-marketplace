# Phase 16P.2 — Live Chat Realtime Reliability

Goal:
Customer and booster receive new order-chat messages without refreshing the page.

Production checks completed before this phase:
- public.order_messages is included in the supabase_realtime publication
- order_messages uses REPLICA IDENTITY FULL
- authenticated SELECT policy exists for authorized order participants

Client fix:
- obtains the active Supabase Auth session before subscribing
- explicitly authenticates Supabase Realtime with the access token
- subscribes to INSERT events for the current order only
- refreshes the conversation immediately when an INSERT event arrives
- refreshes once after successful subscription to close connection race windows
- refreshes when the browser tab becomes visible again
- uses a 5-second fallback only while the realtime websocket is unavailable
- removes the fallback as soon as Realtime reconnects

Realtime remains the primary transport.
No database migration is required.
