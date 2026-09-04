create table if not exists public.support_conversations (
  id uuid primary key default gen_random_uuid(),
  visitor_token_hash text not null unique,
  customer_id uuid null references public.profiles(id) on delete set null,
  visitor_name text null,
  visitor_email text null,
  status text not null default 'open' check (status in ('open', 'closed')),
  last_message_at timestamptz not null default now(),
  customer_last_read_at timestamptz null,
  admin_last_read_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_conversations_status_last_message_idx
  on public.support_conversations (status, last_message_at desc);
create index if not exists support_conversations_customer_idx
  on public.support_conversations (customer_id) where customer_id is not null;

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.support_conversations(id) on delete cascade,
  sender_type text not null check (sender_type in ('visitor', 'admin')),
  sender_user_id uuid null references public.profiles(id) on delete set null,
  body text not null check (char_length(body) between 1 and 1500),
  created_at timestamptz not null default now()
);

create index if not exists support_messages_conversation_created_idx
  on public.support_messages (conversation_id, created_at asc);

alter table public.support_conversations enable row level security;
alter table public.support_messages enable row level security;

-- Intentionally no public/authenticated RLS policies.
-- Visitor and admin access is mediated by server-side routes using the secret server client.
