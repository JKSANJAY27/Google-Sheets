export interface CellData {
  value: string
  formula: string
  computed: string | number
  format: CellFormat
}

export interface CellFormat {
  bold: boolean
  italic: boolean
  textColor: string
  bgColor: string
  fontSize: number
}

export interface SpreadsheetDoc {
  id: string
  title: string
  ownerId: string
  ownerName: string
  createdAt: number
  updatedAt: number
}

export interface UserPresence {
  uid: string
  displayName: string
  color: string
  activeCell: string | null
  lastSeen: number
}

export type CellMap = Record<string, CellData>

export type WriteStatus = 'idle' | 'saving' | 'saved' | 'error'
