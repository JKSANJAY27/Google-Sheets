type TokenType =
    | 'NUMBER'
    | 'STRING'
    | 'CELL_REF'
    | 'CELL_RANGE'
    | 'FUNC'
    | 'PLUS'
    | 'MINUS'
    | 'STAR'
    | 'SLASH'
    | 'COMPARE'
    | 'LPAREN'
    | 'RPAREN'
    | 'COMMA'
    | 'EOF'

interface Token {
    type: TokenType
    value: string
}

export type ASTNode =
    | { type: 'number'; value: number }
    | { type: 'string'; value: string }
    | { type: 'cellRef'; ref: string }
    | { type: 'cellRange'; from: string; to: string }
    | { type: 'binop'; op: string; left: ASTNode; right: ASTNode }
    | { type: 'unary'; op: string; expr: ASTNode }
    | { type: 'call'; name: string; args: ASTNode[] }

function tokenize(src: string): Token[] {
    const tokens: Token[] = []
    let i = 0
    while (i < src.length) {
        const ch = src[i]
        if (/\s/.test(ch)) { i++; continue }
        if (/\d/.test(ch) || (ch === '.' && /\d/.test(src[i + 1] ?? ''))) {
            let num = ''
            while (i < src.length && /[\d.]/.test(src[i])) num += src[i++]
            tokens.push({ type: 'NUMBER', value: num })
            continue
        }
        if (/[A-Za-z]/.test(ch)) {
            let word = ''
            while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) word += src[i++]
            if (i < src.length && src[i] === ':') {
                i++
                let word2 = ''
                while (i < src.length && /[A-Za-z0-9]/.test(src[i])) word2 += src[i++]
                tokens.push({ type: 'CELL_RANGE', value: `${word.toUpperCase()}:${word2.toUpperCase()}` })
            } else if (/^[A-Z]+\d+$/.test(word.toUpperCase())) {
                tokens.push({ type: 'CELL_REF', value: word.toUpperCase() })
            } else {
                tokens.push({ type: 'FUNC', value: word.toUpperCase() })
            }
            continue
        }
        if (ch === '"') {
            let str = ''
            i++
            while (i < src.length && src[i] !== '"') str += src[i++]
            i++
            tokens.push({ type: 'STRING', value: str })
            continue
        }
        if (ch === '>' || ch === '<' || ch === '=') {
            let op = ch
            if (src[i + 1] === '=') { op += '='; i++ }
            else if (ch === '<' && src[i + 1] === '>') { op += '>'; i++ }
            tokens.push({ type: 'COMPARE', value: op })
            i++
            continue
        }
        const simple: Record<string, TokenType> = { '+': 'PLUS', '-': 'MINUS', '*': 'STAR', '/': 'SLASH', '(': 'LPAREN', ')': 'RPAREN', ',': 'COMMA' }
        if (simple[ch]) { tokens.push({ type: simple[ch], value: ch }); i++; continue }
        i++
    }
    tokens.push({ type: 'EOF', value: '' })
    return tokens
}

class Parser {
    private tokens: Token[]
    private pos = 0

    constructor(tokens: Token[]) {
        this.tokens = tokens
    }

    private peek(): Token { return this.tokens[this.pos] }
    private consume(): Token { return this.tokens[this.pos++] }
    private expect(type: TokenType): Token {
        const t = this.consume()
        if (t.type !== type) throw new Error(`Expected ${type} got ${t.type}`)
        return t
    }

    parse(): ASTNode {
        const node = this.parseExpr()
        if (this.peek().type !== 'EOF') throw new Error('Unexpected token')
        return node
    }

    private parseExpr(): ASTNode {
        let left = this.parseAddSub()
        if (this.peek().type === 'COMPARE') {
            const op = this.consume().value
            const right = this.parseAddSub()
            left = { type: 'binop', op, left, right }
        }
        return left
    }

    private parseAddSub(): ASTNode {
        let left = this.parseMulDiv()
        while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
            const op = this.consume().value
            const right = this.parseMulDiv()
            left = { type: 'binop', op, left, right }
        }
        return left
    }

    private parseMulDiv(): ASTNode {
        let left = this.parseUnary()
        while (this.peek().type === 'STAR' || this.peek().type === 'SLASH') {
            const op = this.consume().value
            const right = this.parseUnary()
            left = { type: 'binop', op, left, right }
        }
        return left
    }

    private parseUnary(): ASTNode {
        if (this.peek().type === 'MINUS') {
            this.consume()
            return { type: 'unary', op: '-', expr: this.parsePrimary() }
        }
        if (this.peek().type === 'PLUS') {
            this.consume()
            return this.parsePrimary()
        }
        return this.parsePrimary()
    }

    private parsePrimary(): ASTNode {
        const t = this.peek()
        if (t.type === 'NUMBER') {
            this.consume()
            return { type: 'number', value: parseFloat(t.value) }
        }
        if (t.type === 'STRING') {
            this.consume()
            return { type: 'string', value: t.value }
        }
        if (t.type === 'CELL_REF') {
            this.consume()
            return { type: 'cellRef', ref: t.value }
        }
        if (t.type === 'CELL_RANGE') {
            this.consume()
            const [from, to] = t.value.split(':')
            return { type: 'cellRange', from, to }
        }
        if (t.type === 'FUNC') {
            this.consume()
            this.expect('LPAREN')
            const args: ASTNode[] = []
            while (this.peek().type !== 'RPAREN' && this.peek().type !== 'EOF') {
                args.push(this.parseExpr())
                if (this.peek().type === 'COMMA') this.consume()
            }
            this.expect('RPAREN')
            return { type: 'call', name: t.value, args }
        }
        if (t.type === 'LPAREN') {
            this.consume()
            const expr = this.parseExpr()
            this.expect('RPAREN')
            return expr
        }
        throw new Error(`Unexpected token: ${t.value}`)
    }
}

export function parseFormula(formula: string): ASTNode {
    const src = formula.startsWith('=') ? formula.slice(1) : formula
    const tokens = tokenize(src)
    return new Parser(tokens).parse()
}
