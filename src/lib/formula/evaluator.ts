import { ASTNode } from './parser'
import { CellMap } from '@/types'
import { parseCellId } from '@/lib/utils'

function expandRange(from: string, to: string): string[] {
    const a = parseCellId(from)
    const b = parseCellId(to)
    if (!a || !b) return []
    const cells: string[] = []
    for (let r = Math.min(a.row, b.row); r <= Math.max(a.row, b.row); r++) {
        for (let c = Math.min(a.col, b.col); c <= Math.max(a.col, b.col); c++) {
            cells.push(`${String.fromCharCode(65 + c)}${r + 1}`)
        }
    }
    return cells
}

export function evaluateAST(node: ASTNode, cells: CellMap, visiting: Set<string> = new Set()): number | string {
    if (node.type === 'number') return node.value
    if (node.type === 'string') return node.value

    if (node.type === 'cellRef') {
        if (visiting.has(node.ref)) return '#CYCLE!'
        const cell = cells[node.ref]
        if (!cell) return 0
        const val = cell.computed
        if (typeof val === 'number') return val
        const n = parseFloat(String(val))
        return isNaN(n) ? (String(val) || 0) : n
    }

    if (node.type === 'cellRange') {
        const refs = expandRange(node.from, node.to)
        return refs.map((ref) => {
            const cell = cells[ref]
            if (!cell) return 0
            const n = parseFloat(String(cell.computed))
            return isNaN(n) ? 0 : n
        }).reduce((a, b) => a + b, 0)
    }

    if (node.type === 'unary') {
        const v = evaluateAST(node.expr, cells, visiting)
        if (typeof v === 'string') return '#ERROR!'
        return node.op === '-' ? -v : v
    }

    if (node.type === 'binop') {
        const l = evaluateAST(node.left, cells, visiting)
        const r = evaluateAST(node.right, cells, visiting)
        if (typeof l === 'string' || typeof r === 'string') {
            if (node.op === '+' && typeof l === 'string' && typeof r === 'string') return l + r
            return '#ERROR!'
        }
        if (node.op === '+') return l + r
        if (node.op === '-') return l - r
        if (node.op === '*') return l * r
        if (node.op === '/') {
            if (r === 0) return '#DIV/0!'
            return l / r
        }
        return '#ERROR!'
    }

    if (node.type === 'call') {
        const name = node.name
        if (name === 'SUM') {
            let total = 0
            for (const arg of node.args) {
                const v = evaluateAST(arg, cells, visiting)
                if (typeof v === 'number') total += v
                else if (typeof v === 'string' && !v.startsWith('#')) total += parseFloat(v) || 0
            }
            return total
        }
        if (name === 'AVERAGE') {
            const vals: number[] = []
            for (const arg of node.args) {
                const v = evaluateAST(arg, cells, visiting)
                if (typeof v === 'number') vals.push(v)
            }
            if (vals.length === 0) return '#DIV/0!'
            return vals.reduce((a, b) => a + b, 0) / vals.length
        }
        if (name === 'MAX') {
            const vals: number[] = []
            for (const arg of node.args) {
                const v = evaluateAST(arg, cells, visiting)
                if (typeof v === 'number') vals.push(v)
            }
            return vals.length ? Math.max(...vals) : 0
        }
        if (name === 'MIN') {
            const vals: number[] = []
            for (const arg of node.args) {
                const v = evaluateAST(arg, cells, visiting)
                if (typeof v === 'number') vals.push(v)
            }
            return vals.length ? Math.min(...vals) : 0
        }
        if (name === 'COUNT') {
            let count = 0
            for (const arg of node.args) {
                const v = evaluateAST(arg, cells, visiting)
                if (typeof v === 'number') count++
            }
            return count
        }
        if (name === 'IF') {
            if (node.args.length < 2) return '#ERROR!'
            const cond = evaluateAST(node.args[0], cells, visiting)
            const truthy = cond !== 0 && cond !== ''
            return evaluateAST(truthy ? node.args[1] : (node.args[2] ?? { type: 'number', value: 0 }), cells, visiting)
        }
        return `#NAME?`
    }

    return '#ERROR!'
}
