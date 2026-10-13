import type { ReactNode } from 'react'

/**
 * Markdown mínimo para los textos legales (src/content/legal/*.md), sin dependencias
 * ni innerHTML: todo se convierte en elementos de React.
 *
 * Soporta lo que usan esos textos: #/##/### títulos, párrafos, listas (- y 1.) con
 * líneas de continuación indentadas, tablas, citas (>), **negrita**, *cursiva*,
 * [enlaces](url), URLs y correos sueltos.
 */

export type Block =
  | { type: 'heading'; level: 1 | 2 | 3; text: string; id: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }
  | { type: 'quote'; blocks: Block[] }

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const LIST_ITEM = /^(\d+\.|-)\s+(.*)$/
const splitRow = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())

export function parseBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      i++
      continue
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed)
    if (heading) {
      const text = heading[2]
      blocks.push({ type: 'heading', level: heading[1].length as 1 | 2 | 3, text, id: slugify(text) })
      i++
      continue
    }

    if (trimmed.startsWith('>')) {
      const inner: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        inner.push(lines[i].trim().replace(/^>\s?/, ''))
        i++
      }
      blocks.push({ type: 'quote', blocks: parseBlocks(inner.join('\n')) })
      continue
    }

    if (trimmed.startsWith('|')) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = splitRow(lines[i])
        if (!cells.every((c) => /^:?-{3,}:?$/.test(c))) rows.push(cells)
        i++
      }
      const [head = [], ...body] = rows
      blocks.push({ type: 'table', head, rows: body })
      continue
    }

    const item = LIST_ITEM.exec(trimmed)
    if (item && !line.startsWith(' ')) {
      const ordered = item[1] !== '-'
      const items: string[] = []
      while (i < lines.length) {
        const current = lines[i]
        const match = LIST_ITEM.exec(current.trim())
        if (match && !current.startsWith(' ') && (match[1] !== '-') === ordered) {
          items.push(match[2])
        } else if (current.startsWith(' ') && current.trim() && items.length) {
          // línea de continuación del ítem anterior
          items[items.length - 1] += ` ${current.trim()}`
        } else {
          break
        }
        i++
      }
      blocks.push({ type: 'list', ordered, items })
      continue
    }

    const para: string[] = []
    while (i < lines.length) {
      const t = lines[i].trim()
      if (!t || /^(#{1,3}\s|>|\|)/.test(t) || (LIST_ITEM.test(t) && !lines[i].startsWith(' '))) break
      para.push(t)
      i++
    }
    blocks.push({ type: 'paragraph', text: para.join(' ') })
  }

  return blocks
}

const INLINE =
  /\*\*(.+?)\*\*|\*([^*\s][^*]*?)\*|\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s)<]+[^\s)<.,;:])|([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g

const LINK = 'text-red-ink underline decoration-red/40 underline-offset-3 transition-colors duration-200 hover:decoration-red'

function link(href: string, children: ReactNode, key: string) {
  // Las páginas de tytsoftware.com se abren en la misma pestaña.
  const external = /^https?:/.test(href) && !/^https:\/\/(www\.)?tytsoftware\.com(\/|$)/.test(href)
  return (
    <a key={key} href={href} className={LINK} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  )
}

export function renderInline(text: string, keyPrefix = 'i'): ReactNode[] {
  const out: ReactNode[] = []
  let last = 0
  let n = 0
  for (const m of text.matchAll(INLINE)) {
    const at = m.index ?? 0
    if (at > last) out.push(text.slice(last, at))
    const key = `${keyPrefix}-${n++}`
    if (m[1] !== undefined) out.push(<strong key={key} className="font-semibold text-ink">{renderInline(m[1], key)}</strong>)
    else if (m[2] !== undefined) out.push(<em key={key}>{renderInline(m[2], key)}</em>)
    else if (m[3] !== undefined) out.push(link(m[4], renderInline(m[3], key), key))
    else if (m[5] !== undefined) out.push(link(m[5], m[5], key))
    else if (m[6] !== undefined) out.push(link(`mailto:${m[6]}`, m[6], key))
    last = at + m[0].length
  }
  if (last < text.length) out.push(text.slice(last))
  return out
}

export function renderBlocks(blocks: Block[], keyPrefix = 'b'): ReactNode[] {
  return blocks.map((block, idx) => {
    const key = `${keyPrefix}-${idx}`
    switch (block.type) {
      case 'heading':
        if (block.level === 1) {
          return (
            <h1 key={key} id={block.id} className="display text-4xl text-ink sm:text-5xl">
              {renderInline(block.text, key)}
            </h1>
          )
        }
        if (block.level === 2) {
          return (
            <h2 key={key} id={block.id} className="display mt-14 scroll-mt-24 text-2xl text-ink sm:text-3xl">
              {renderInline(block.text, key)}
            </h2>
          )
        }
        return (
          <h3 key={key} id={block.id} className="mt-8 scroll-mt-24 text-lg font-semibold text-ink">
            {renderInline(block.text, key)}
          </h3>
        )
      case 'paragraph':
        return (
          <p key={key} className="mt-4 leading-relaxed text-ink-soft">
            {renderInline(block.text, key)}
          </p>
        )
      case 'list': {
        const List = block.ordered ? 'ol' : 'ul'
        return (
          <List
            key={key}
            className={`mt-4 space-y-2 pl-5 leading-relaxed text-ink-soft marker:text-red ${block.ordered ? 'list-decimal' : 'list-disc'}`}
          >
            {block.items.map((item, j) => (
              <li key={`${key}-${j}`} className="pl-1">
                {renderInline(item, `${key}-${j}`)}
              </li>
            ))}
          </List>
        )
      }
      case 'table':
        return (
          <div key={key}>
            {/* Celular: cada fila como ficha, sin scroll horizontal */}
            <dl className="mt-6 border-b border-line sm:hidden">
              {block.rows.map((row, r) => (
                <div key={`${key}-c${r}`} className="border-t border-line py-4">
                  <dt className="font-semibold text-ink">{renderInline(row[0] ?? '', `${key}-c${r}-0`)}</dt>
                  {row.slice(1).map((cell, j) => (
                    <dd key={`${key}-c${r}-${j + 1}`} className="mt-2 text-ink-soft">
                      <span className="mono-label block text-mist">{renderInline(block.head[j + 1] ?? '', `${key}-c${r}-l${j}`)}</span>
                      {renderInline(cell, `${key}-c${r}-${j + 1}`)}
                    </dd>
                  ))}
                </div>
              ))}
            </dl>
            <div className="mt-6 hidden overflow-x-auto border border-line sm:block">
              <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
                <thead className="bg-paper-deep">
                  <tr>
                    {block.head.map((cell, j) => (
                      <th key={`${key}-h${j}`} scope="col" className="mono-label px-4 py-3 align-bottom text-ink">
                        {renderInline(cell, `${key}-h${j}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, r) => (
                    <tr key={`${key}-r${r}`} className="border-t border-line">
                      {row.map((cell, j) => (
                        <td key={`${key}-r${r}-${j}`} className="px-4 py-3 align-top leading-relaxed text-ink-soft">
                          {renderInline(cell, `${key}-r${r}-${j}`)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      case 'quote':
        return (
          <div key={key} className="mt-8 border-l-2 border-red bg-paper-lift px-5 py-4 [&>*:first-child]:mt-0">
            {renderBlocks(block.blocks, key)}
          </div>
        )
    }
  })
}
