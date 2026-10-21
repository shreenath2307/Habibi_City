export default function GlobalLoading() {
  return (
    <div className="w-full py-16 flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-8 h-8 border-2 border-[var(--accent-brass)] border-t-transparent rounded-full animate-spin" />
      <div className="font-mono text-xs uppercase tracking-widest text-[var(--ink-secondary)]">
        Consulting the Railway Timetable &bull; Please Hold
      </div>
    </div>
  )
}
