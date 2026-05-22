'use client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownProseProps {
  content: string;
  className?: string;
}

/**
 * Renders Markdown content with Y2K-styled prose.
 * Headings: Bricolage Grotesque condensed-bold display
 * Body: General Sans
 * Code: IBM Plex Mono with acid-tinted background
 * Tables, lists, blockquotes all styled per DESIGN.md tokens.
 */
export function MarkdownProse({ content, className = '' }: MarkdownProseProps) {
  return (
    <div className={`md-prose ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => (
            <h1
              {...props}
              className="font-display font-extrabold text-4xl text-ink mt-lg mb-md"
              style={{ fontVariationSettings: '"wdth" 65', letterSpacing: '-0.03em' }}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              {...props}
              className="font-display font-bold text-2xl text-ink mt-lg mb-sm border-b-[1.5px] border-ink-muted pb-xs"
              style={{ fontVariationSettings: '"wdth" 70', letterSpacing: '-0.02em' }}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              {...props}
              className="font-display font-bold text-xl text-ink mt-md mb-xs"
              style={{ fontVariationSettings: '"wdth" 75', letterSpacing: '-0.01em' }}
            >
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4
              {...props}
              className="font-display font-semibold text-lg text-ink mt-md mb-xs"
              style={{ fontVariationSettings: '"wdth" 80' }}
            >
              {children}
            </h4>
          ),
          p: ({ children, ...props }) => (
            <p {...props} className="font-body text-base text-ink-soft leading-relaxed mb-md">
              {children}
            </p>
          ),
          strong: ({ children, ...props }) => (
            <strong {...props} className="font-body font-bold text-ink">
              {children}
            </strong>
          ),
          em: ({ children, ...props }) => (
            <em {...props} className="font-body italic text-ink-soft">
              {children}
            </em>
          ),
          a: ({ children, href, ...props }) => (
            <a
              {...props}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink underline decoration-cyber decoration-2 underline-offset-2 hover:bg-cyber hover:text-ink hover:no-underline"
            >
              {children}
            </a>
          ),
          ul: ({ children, ...props }) => (
            <ul {...props} className="font-body text-base text-ink-soft list-none pl-md mb-md flex flex-col gap-xs">
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol {...props} className="font-body text-base text-ink-soft list-decimal pl-lg mb-md flex flex-col gap-xs">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li {...props} className="relative pl-md before:content-['▸'] before:absolute before:left-0 before:text-cyber before:font-bold">
              {children}
            </li>
          ),
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  {...props}
                  className="font-mono text-sm bg-acid/20 text-ink border-[1px] border-ink-muted px-1 py-0.5 rounded-none"
                >
                  {children}
                </code>
              );
            }
            return (
              <code {...props} className={`font-mono text-sm text-ink ${className ?? ''}`}>
                {children}
              </code>
            );
          },
          pre: ({ children, ...props }) => (
            <pre
              {...props}
              className="bg-ink text-paper font-mono text-sm p-md rounded-none border-[2px] border-ink shadow-[4px_4px_0_var(--color-chrome)] overflow-x-auto my-md"
            >
              {children}
            </pre>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              {...props}
              className="border-l-[4px] border-magenta pl-md my-md font-body italic text-ink-soft"
            >
              {children}
            </blockquote>
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-md border-[2.5px] border-ink shadow-[4px_4px_0_var(--color-ink)]">
              <table {...props} className="w-full font-body text-sm text-ink border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead {...props} className="bg-ink text-paper">
              {children}
            </thead>
          ),
          th: ({ children, ...props }) => (
            <th
              {...props}
              className="font-mono text-xs uppercase tracking-wider px-md py-sm text-left border-r-[1px] border-paper last:border-r-0"
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td {...props} className="px-md py-sm border-t-[1px] border-ink-muted border-r-[1px] last:border-r-0">
              {children}
            </td>
          ),
          hr: () => <hr className="my-lg border-0 border-t-[2.5px] border-ink" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
