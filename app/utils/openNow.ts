const DAYS = 'LMXJVSD'

/**
 * Interpreta el horario del Ministerio («L-V: 07:00-22:00; S-D: 08:00-21:00», «L-D: 24H»).
 * Devuelve true/false, o null si no se puede interpretar.
 */
export function isOpenNow(schedule: string, now = new Date()): boolean | null {
  const today = (now.getDay() + 6) % 7 // 0 = lunes
  const minutes = now.getHours() * 60 + now.getMinutes()
  let understood = false

  for (const part of schedule.split(';')) {
    const m = part.trim().match(/^([LMXJVSD])(?:\s*-\s*([LMXJVSD]))?\s*:\s*(.+)$/)
    if (!m) continue
    understood = true
    const a = DAYS.indexOf(m[1]!)
    const b = m[2] ? DAYS.indexOf(m[2]) : a
    const inDays = a <= b ? today >= a && today <= b : today >= a || today <= b
    if (!inDays) continue
    if (/24\s*H/i.test(m[3]!)) return true
    for (const r of m[3]!.matchAll(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/g)) {
      const start = Number(r[1]) * 60 + Number(r[2])
      const end = Number(r[3]) * 60 + Number(r[4])
      const open = start < end ? minutes >= start && minutes < end : minutes >= start || minutes < end
      if (open) return true
    }
  }
  return understood ? false : null
}
