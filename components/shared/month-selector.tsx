'use client'
import { useRouter } from 'next/navigation'

interface Props {
  months: { value: string; label: string }[]
  currentMonthStr: string
}

export default function MonthSelector({ months, currentMonthStr }: Props) {
  const router = useRouter()
  return (
    <select 
      name="month" 
      defaultValue={currentMonthStr}
      onChange={(e) => {
        const url = new URL(window.location.href)
        url.searchParams.set('month', e.target.value)
        router.push(url.pathname + url.search)
      }}
      className="h-9 w-48 rounded-md border border-border/50 bg-muted/50 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {months.map(m => (
        <option key={m.value} value={m.value}>{m.label}</option>
      ))}
    </select>
  )
}
