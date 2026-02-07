const RECORD_KEY = 'higher-lower-record'

export function getRecord(): number {
  const stored = localStorage.getItem(RECORD_KEY)
  return stored ? parseInt(stored, 10) : 0
}

export function setRecord(record: number): void {
  localStorage.setItem(RECORD_KEY, String(record))
}
