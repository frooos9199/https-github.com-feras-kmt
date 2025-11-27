import { useEffect, useState } from "react";

function getTimeDiff(target: Date, now: Date) {
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export default function EventCountdown({ event, language }: { event: any, language: string }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!event.date || !event.time) return null;
  const datePart = typeof event.date === 'string' ? event.date.split('T')[0] : '';
  const start = new Date(datePart + 'T' + event.time);
  if (isNaN(start.getTime())) return null;
  let end: Date | null = null;
  if (event.endDate && event.endTime) {
    const endDatePart = typeof event.endDate === 'string' ? event.endDate.split('T')[0] : '';
    end = new Date(endDatePart + 'T' + event.endTime);
    if (isNaN(end.getTime())) return null;
  }

  let state: 'before' | 'during' | 'ended' = 'before';
  if (end && now > end) state = 'ended';
  else if (now >= start && (!end || now <= end)) state = 'during';

  let color = '';
  let label = '';
  let diff = null as ReturnType<typeof getTimeDiff> | null;
  if (state === 'before') {
    color = 'text-green-500';
    label = language === 'ar' ? 'يبدأ بعد' : 'Starts in';
    diff = getTimeDiff(start, now);
  } else if (state === 'during') {
    color = 'text-orange-400';
    label = language === 'ar' ? 'ينتهي بعد' : 'Ends in';
    diff = end ? getTimeDiff(end, now) : null;
  } else {
    color = 'text-red-500';
    label = language === 'ar' ? 'انتهى الحدث' : 'Event Ended';
  }

  let bgColor = '';
  if (state === 'before') bgColor = 'bg-zinc-900/80';
  else if (state === 'during') bgColor = 'bg-zinc-900/80';
  else bgColor = 'bg-zinc-900/80';

  let textColor = color;
  if (state === 'ended') textColor = 'text-red-500';

  return (
    <div className={`w-full flex items-center justify-center py-2 font-bold text-lg ${textColor} ${bgColor} border border-zinc-700 rounded-b-xl mb-1`} style={{letterSpacing: 1}}>
      {state === 'ended' ? (
        <span>{label}</span>
      ) : (
        <span>
          {label}
          {language === 'ar' ? ' : ' : ': '}
          {diff && typeof diff.days === 'number' && diff.days > 0 && (
            <>
              {language === 'ar' ? `${diff.days} يوم ` : `${diff.days}d `}
            </>
          )}
          {diff && typeof diff.hours === 'number' && typeof diff.minutes === 'number' && typeof diff.seconds === 'number'
            ? `${diff.hours.toString().padStart(2, '0')}:${diff.minutes.toString().padStart(2, '0')}:${diff.seconds.toString().padStart(2, '0')}`
            : '00:00:00'}
        </span>
      )}
    </div>
  );
}
