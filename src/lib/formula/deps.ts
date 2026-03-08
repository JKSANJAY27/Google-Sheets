import { CellMap } from '@/types'
import { parseCellId } from '@/lib/utils'
import { parseFormula, ASTNode } from './parser'

function extractRefs(node: ASTNode): string[] {
    if (node.type === 'cellRef') return [node.ref]
    if (node.type === 'cellRange') {
        const a = parseCellId(node.from)
        const b = parseCellId(node.to)
        if (!a || !b) return []
        const refs: string[] = []
        for (let r = Math.min(a.row, b.row); r <= Math.max(a.row, b.row); r++) {
            for (let c = Math.min(a.col, b.col); c <= Math.max(a.col, b.col); c++) {
                refs.push(`${String.fromCharCode(65 + c)}${r + 1}`)
            }
        }
        return refs
    }
    if (node.type === 'binop') return [...extractRefs(node.left), ...extractRefs(node.right)]
    if (node.type === 'unary') return extractRefs(node.expr)
    if (node.type === 'call') return node.args.flatMap(extractRefs)
    return []
}

function getDependencies(formula: string): string[] {
    if (!formula.startsWith('=')) return []
    try {
        const ast = parseFormula(formula)
        return [...new Set(extractRefs(ast))]
    } catch {
        return []
    }
}

export function buildEvalOrder(cells: CellMap): { order: string[]; cycles: Set<string> } {
    const deps: Record<string, string[]> = {}
    for (const cellId of Object.keys(cells)) {
        deps[cellId] = getDependencies(cells[cellId].formula)
    }

    const visited = new Set<string>()
    const cycles = new Set<string>()
    const order: string[] = []

    function visit(id: string, path: Set<string>) {
        if (path.has(id)) {
            for (const p of path) cycles.add(p)
            return
        }
        if (visited.has(id)) return
        path.add(id)
        for (const dep of deps[id] ?? []) {
            visit(dep, path)
        }
        path.delete(id)
        visited.add(id)
        order.push(id)
    }

    for (const id of Object.keys(cells)) {
        visit(id, new Set())
    }

    return { order, cycles }
}
