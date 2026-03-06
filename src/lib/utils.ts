export function getUserColor(uid: string): string {
    const colors = [
        '#F87171',
        '#FB923C',
        '#FBBF24',
        '#34D399',
        '#38BDF8',
        '#818CF8',
        '#F472B6',
        '#A78BFA',
        '#4ADE80',
        '#22D3EE',
    ]
    let hash = 0
    for (let i = 0; i < uid.length; i++) {
        hash = uid.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
}

export function getCellId(row: number, col: number): string {
    const colLetter = String.fromCharCode(65 + col)
    return `${colLetter}${row + 1}`
}

export function parseCellId(cellId: string): { row: number; col: number } | null {
    const match = cellId.match(/^([A-Z]+)(\d+)$/)
    if (!match) return null
    let col = 0
    for (const ch of match[1]) {
        col = col * 26 + (ch.charCodeAt(0) - 64)
    }
    return { row: parseInt(match[2]) - 1, col: col - 1 }
}
