import { useQuery } from '@tanstack/react-query';

export interface MeetupEvent {
  id: string;
  title: string;
  date: string;       // human-readable, Houston timezone
  rawDate: string | null; // ISO string for logic
  link: string;
  description: string;
  status: 'upcoming' | 'past';
}

async function fetchEvents(): Promise<MeetupEvent[]> {
  const res = await fetch('/api/events');
  if (!res.ok) throw new Error(`Events API returned ${res.status}`);
  return res.json();
}

export function useEvents() {
  return useQuery<MeetupEvent[]>({
    queryKey: ['meetup-events'],
    queryFn: fetchEvents,
    staleTime: 15 * 60 * 1000, // matches server cache TTL
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
