-- Create a table to track user progress
create table user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  module_id text not null,
  status text check (status in ('pending', 'completed')) not null,
  score integer,
  completed_at timestamptz default now(),
  due_date timestamptz,
  
  -- Prevent duplicate records for the same module/user combo? 
  -- Actually, we might want history, but for this simple app, unique constraint is better.
  unique(user_id, module_id)
);

-- Enable RLS
alter table user_progress enable row level security;

-- Create Policy: Users can view their own progress
create policy "Users can view own progress"
on user_progress for select
using ( auth.uid() = user_id );

-- Create Policy: Users can insert/update their own progress
create policy "Users can update own progress"
on user_progress for insert
with check ( auth.uid() = user_id );

create policy "Users can update own progress update"
on user_progress for update
using ( auth.uid() = user_id );
