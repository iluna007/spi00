import { useMemo, memo } from 'react'
import ReactMarkdown from 'react-markdown'

/**
 * Resuelve un href o nombre de enlace al nodo del grafo (por path/name/id).
 * Acepta "Axioma 1", "Axioma%201", rutas con .md, etc.
 */
function findNodeByLinkHref(href, nodes) {
  if (!href || !nodes?.length) return null
  try {
    const decoded = decodeURIComponent(String(href).trim())
    const pathPart = decoded.split('/').pop() || decoded
    const nameWithoutExt = pathPart.replace(/\.md$/i, '').trim()
    return (
      nodes.find((n) => n.id === nameWithoutExt || n.name === nameWithoutExt) ||
      nodes.find(
        (n) =>
          n.path &&
          (n.path.endsWith(pathPart) || n.path.endsWith(nameWithoutExt + '.md'))
      )
    )
  } catch {
    return null
  }
}

/**
 * Convierte [[nombre]] y [nombre] (si nombre es un nodo) en enlaces markdown [nombre](nombre)
 * para que al hacer clic se pueda seleccionar ese nodo en el grafo.
 */
function contentWithClickableWikiLinks(rawContent, graphNodes) {
  if (!rawContent) return rawContent
  // [[Axioma 1]] o [[Proposición 2]] -> [Axioma 1](Axioma 1) para que el clic seleccione el nodo en el grafo
  let out = rawContent.replace(/\[\[([^\]]+)\]\]/g, (_, text) => `[${text}](${text.trim()})`)
  if (!graphNodes?.length) return out
  const nodeNames = new Set(graphNodes.flatMap((n) => [n.id, n.name].filter(Boolean)))
  out = out.replace(/\]\([^)]+\)/g, (m) => `\x00${m}\x00`)
  out = out.replace(/\[([^\]#|]+)\]/g, (match, text) => {
    const t = text.trim()
    return nodeNames.has(t) ? `[${text}](${t})` : match
  })
  out = out.replace(/\x00/g, '')
  return out
}

/**
 * Panel lateral que muestra el contenido markdown del nodo seleccionado.
 * Los enlaces que apuntan a otro nodo del grafo disparan onSelectNode en lugar de navegar.
 *
 * @param {Object} props
 * @param {Object|null} props.node - Nodo seleccionado (con .name, etc.) o null si el panel está cerrado
 * @param {string} props.content - Contenido markdown a renderizar
 * @param {boolean} props.loading - true mientras se carga el contenido
 * @param {Array} props.graphNodes - Lista de nodos del grafo (para resolver enlaces)
 * @param {function(Object)} props.onSelectNode - Callback al seleccionar otro nodo (p. ej. desde un enlace)
 * @param {function()} props.onClose - Callback al cerrar el panel
 * @param {boolean} [props.open] - Si el panel debe mostrarse (ancho > 0)
 * @param {string} [props.accentColor] - Color del nodo (hex) para la barra superior del panel
 * @param {string} [props.graphBgColor] - Color de fondo del espacio (compartido)
 * @param {string} [props.borderClass] - Clase de borde derecho (contorno)
 * @param {string} [props.borderBottomClass] - Clase de borde inferior (header)
 * @param {string} [props.textClass] - Clase de texto para legibilidad
 * @param {Array<{ title: string, text: string }>} [props.hints] - Hints de Context7 para el nodo
 */
function NodeContentPanel({
  node,
  content,
  loading,
  graphNodes = [],
  hints = [],
  onSelectNode,
  onClose,
  open = true,
  accentColor,
  graphBgColor,
  borderClass = 'border-r-white/90',
  borderBottomClass = 'border-b-white/90',
  textClass = 'text-neutral-200',
}) {
  const isOpen = open && node != null
  const processedContent = useMemo(
    () => contentWithClickableWikiLinks(content, graphNodes),
    [content, graphNodes]
  )

  return (
    <div
      className={`absolute left-0 top-0 z-20 flex h-full shrink-0 flex-col border-r-2 ${borderClass} shadow-xl transition-[width] duration-300 ease-out md:relative md:z-auto ${
        isOpen ? 'w-[min(420px,92vw)]' : 'w-0 overflow-hidden border-r-0'
      }`}
      style={{ backgroundColor: graphBgColor ?? undefined }}
    >
      {node && (
        <>
          {/* Barra superior con el color del tipo de nodo */}
          {accentColor && (
            <div
              className="h-1 shrink-0"
              style={{ backgroundColor: accentColor }}
              aria-hidden
            />
          )}
          <div
            className={`flex shrink-0 items-center justify-between gap-2 border-b-2 px-4 py-2 ${borderBottomClass}`}
            style={
              accentColor
                ? { borderTop: `1px solid ${accentColor}40`, backgroundColor: `${accentColor}12` }
                : undefined
            }
          >
            <h3 className={`truncate text-xs font-medium ${textClass}`}>
              {node.name}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className={`shrink-0 rounded p-1 opacity-70 hover:opacity-100 ${textClass}`}
              aria-label="Cerrar panel"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className={`min-h-0 flex-1 overflow-y-auto px-4 py-3 ${textClass}`}>
            {loading ? (
              <p className="opacity-70">Cargando…</p>
            ) : (
              <article className={`MarkdownPanel text-sm opacity-90 [&_h1]:mb-1.5 [&_h1]:text-sm [&_h1]:font-semibold [&_h2]:mb-1.5 [&_h2]:mt-3 [&_h2]:text-sm [&_h2]:font-semibold [&_p]:mb-1.5 [&_p]:text-xs [&_ul]:list-inside [&_ul]:list-disc [&_ul]:mb-1.5 [&_ul]:text-xs [&_ol]:list-inside [&_ol]:list-decimal [&_ol]:mb-1.5 [&_ol]:text-xs [&_a]:underline [&_a]:cursor-pointer [&_strong]:font-semibold [&_hr]:my-2 [&_hr]:border-current [&_hr]:opacity-50`}>
                <ReactMarkdown
                  components={{
                    h1: ({ children, ...props }) => (
                      <h2 className="mb-1.5 text-sm font-semibold text-neutral-100" {...props}>
                        {children}
                      </h2>
                    ),
                    a: ({ href, ...props }) => {
                      const targetNode = findNodeByLinkHref(href, graphNodes)
                      const isGraphLink = !!targetNode
                      const handleLinkClick = (e) => {
                        if (isGraphLink) {
                          e.preventDefault()
                          onSelectNode(targetNode)
                        }
                      }
                      return (
                        <a
                          href={href}
                          {...props}
                          className={
                            isGraphLink
                              ? 'cursor-pointer font-medium text-sky-300 underline decoration-sky-500/60 hover:text-sky-200 hover:decoration-sky-400'
                              : 'text-neutral-200 hover:text-white underline'
                          }
                          title={isGraphLink ? 'Ir a este nodo en el grafo' : undefined}
                          target={isGraphLink ? undefined : '_blank'}
                          rel={isGraphLink ? undefined : 'noopener noreferrer'}
                          onClick={handleLinkClick}
                        />
                      )
                    },
                  }}
                >
                  {processedContent}
                </ReactMarkdown>
              </article>
            )}
            {hints?.length > 0 && (
              <div className="mt-4 border-t border-current border-opacity-20 pt-3">
                <div className="text-[10px] font-medium uppercase tracking-wider opacity-70 mb-2">Context7</div>
                {hints.map((h, i) => (
                  <div key={i} className="mb-2">
                    <div className="text-xs font-medium opacity-90">{h.title}</div>
                    <p className="text-xs opacity-80">{h.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default memo(NodeContentPanel)
