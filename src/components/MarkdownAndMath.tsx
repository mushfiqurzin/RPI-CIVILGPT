import React from "react";
import katex from "katex";

interface MarkdownAndMathProps {
  content: string;
}

export default function MarkdownAndMath({ content }: MarkdownAndMathProps) {
  if (!content) return null;

  // 1. Split string by block math delimiter ($$)
  const parts = content.split("$$");
  
  return (
    <div className="space-y-3 font-sans">
      {parts.map((part, index) => {
        const isBlockMath = index % 2 === 1;

        if (isBlockMath) {
          // Render as block math
          try {
            const html = katex.renderToString(part.trim(), {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <div 
                key={index} 
                className="overflow-x-auto overflow-y-hidden py-1.5 px-3 my-1.5 bg-slate-50/80 border border-slate-150 rounded-lg text-slate-800 text-center text-sm scrollbar-none max-w-full"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch (err) {
            console.error("KaTeX block error:", err);
            return <pre key={index} className="text-red-500 font-mono bg-red-50 p-2 rounded text-xs">$$\n{part}\n$$</pre>;
          }
        } else {
          // Render as markdown lines (including inline math)
          return <React.Fragment key={index}>{renderMarkdownBlock(part)}</React.Fragment>;
        }
      })}
    </div>
  );
}

function renderMarkdownBlock(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  
  let currentTable: string[] = [];
  let currentList: { type: "ul" | "ol"; items: string[] } | null = null;
  let currentParagraph: string[] = [];

  const flushParagraph = (key: number) => {
    if (currentParagraph.length > 0) {
      nodes.push(
        <p key={`p-${key}`} className="text-slate-700 leading-relaxed text-justify mb-2.5">
          {renderInlineMarkdown(currentParagraph.join("\n"))}
        </p>
      );
      currentParagraph = [];
    }
  };

  const flushList = (key: number) => {
    if (currentList) {
      if (currentList.type === "ul") {
        nodes.push(
          <ul key={`ul-${key}`} className="list-disc pl-6 space-y-1.5 mb-3 text-slate-700">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        nodes.push(
          <ol key={`ol-${key}`} className="list-decimal pl-6 space-y-1.5 mb-3 text-slate-700">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {renderInlineMarkdown(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  const flushTable = (key: number) => {
    if (currentTable.length > 0) {
      // Split separator lines out
      const rows = currentTable.filter(row => !row.match(/^\|\s*[-|:\s]+\s*\|$/));
      
      if (rows.length > 0) {
        // Find if header format exists
        const hasHeader = currentTable[1]?.match(/^\|\s*[-|:\s]+\s*\|$/);
        const headers = hasHeader ? parseTableRow(rows[0]) : null;
        const bodyRows = hasHeader ? rows.slice(1) : rows;

        nodes.push(
          <div key={`table-container-${key}`} className="overflow-x-auto my-4 border border-slate-200 rounded-xl shadow-sm">
            <table className="min-w-full text-xs md:text-sm divide-y divide-slate-200">
              {headers && (
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    {headers.map((h, idx) => (
                      <th key={idx} className="px-3.5 py-2.5 text-left font-semibold border-b border-slate-250">
                        {renderInlineMarkdown(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className="divide-y divide-slate-150 bg-white text-slate-700">
                {bodyRows.map((row, rIdx) => {
                  const cells = parseTableRow(row);
                  return (
                    <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2">
                          {renderInlineMarkdown(cell)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
      currentTable = [];
    }
  };

  const flushAll = (key: number) => {
    flushParagraph(key);
    flushList(key);
    flushTable(key);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 1. Horizontal Rules
    if (trimmedLine === "---" || trimmedLine === "***" || trimmedLine === "___") {
      flushAll(i);
      nodes.push(<hr key={`hr-${i}`} className="my-4 border-slate-200" />);
      continue;
    }

    // 2. Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushAll(i);
      const level = headingMatch[1].length;
      const textVal = headingMatch[2];
      
      let headingClasses = "font-bold text-slate-900 leading-tight mt-5 mb-2.5 tracking-tight";
      if (level === 1) headingClasses += " text-2xl border-b border-slate-200 pb-1.5";
      else if (level === 2) headingClasses += " text-xl";
      else if (level === 3) headingClasses += " text-lg text-slate-800";
      else headingClasses += " text-base text-slate-800";

      const ElementTag = `h${level}` as any;
      nodes.push(
        <ElementTag key={`h-${i}`} className={headingClasses}>
          {renderInlineMarkdown(textVal)}
        </ElementTag>
      );
      continue;
    }

    // 3. Tables
    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      flushParagraph(i);
      flushList(i);
      currentTable.push(trimmedLine);
      continue;
    } else {
      flushTable(i);
    }

    // 4. Lists (ul/ol)
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);

    if (ulMatch) {
      flushParagraph(i);
      const content = ulMatch[2];
      if (currentList && currentList.type === "ul") {
        currentList.items.push(content);
      } else {
        flushList(i);
        currentList = { type: "ul", items: [content] };
      }
      continue;
    } else if (olMatch) {
      flushParagraph(i);
      const content = olMatch[2];
      if (currentList && currentList.type === "ol") {
        currentList.items.push(content);
      } else {
        flushList(i);
        currentList = { type: "ol", items: [content] };
      }
      continue;
    } else {
      flushList(i);
    }

    // 5. Empty lines
    if (trimmedLine === "") {
      flushAll(i);
      continue;
    }

    // 6. Paragraph line accumulation
    currentParagraph.push(line);
  }

  flushAll(lines.length);

  return nodes;
}

function parseTableRow(rowText: string): string[] {
  const text = rowText.slice(1, -1);
  return text.split("|").map(cell => cell.trim());
}

function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return "";

  // Split by $ to isolate inline math
  const parts = text.split("$");
  
  return parts.map((part, idx) => {
    const isInlineMath = idx % 2 === 1;
    
    if (isInlineMath) {
      try {
        const html = katex.renderToString(part.trim(), {
          displayMode: false,
          throwOnError: false,
        });
        return (
          <span 
            key={idx} 
            className="inline-block mx-1 font-sans text-orange-600 font-extrabold tracking-wide"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch (err) {
        console.error("KaTeX inline error:", err);
        return <span key={idx} className="text-red-500 font-mono">${part}$</span>;
      }
    } else {
      // Parse classic inline styles
      return parseTextFormatter(part, idx);
    }
  });
}

function parseTextFormatter(text: string, parentIdx: number): React.ReactNode {
  // 1. Spit code blocks
  const codeParts = text.split("`");
  return codeParts.map((b, bIdx) => {
    const isCode = bIdx % 2 === 1;
    if (isCode) {
      return (
        <code key={`code-${parentIdx}-${bIdx}`} className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs font-mono border border-slate-200">
          {b}
        </code>
      );
    }
    
    // 2. Split bold and italic inside non-code part
    return parseBoldItalic(b, `${parentIdx}-${bIdx}`);
  });
}

function parseBoldItalic(text: string, baseKey: string): React.ReactNode {
  const boldParts = text.split("**");
  
  return boldParts.map((p, pIdx) => {
    const isBold = pIdx % 2 === 1;
    
    const italicParts = p.split("*");
    const renderedItalics = italicParts.map((sp, spIdx) => {
      const isItalic = spIdx % 2 === 1;
      
      let innerContent: React.ReactNode = sp;
      
      // Support double underscores "__" as bold too
      if (sp.includes("__")) {
        const uParts = sp.split("__");
        innerContent = uParts.map((up, upIdx) => {
          const isUBold = upIdx % 2 === 1;
          if (isUBold) {
            return <strong key={`ubold-${upIdx}`} className="font-extrabold text-slate-900">{up}</strong>;
          }
          return up;
        });
      }
      
      if (isItalic) {
        return <em key={`italic-${baseKey}-${pIdx}-${spIdx}`} className="italic">{innerContent}</em>;
      }
      return <React.Fragment key={`span-${baseKey}-${pIdx}-${spIdx}`}>{innerContent}</React.Fragment>;
    });
    
    if (isBold) {
      return (
        <strong key={`bold-${baseKey}-${pIdx}`} className="font-bold text-slate-900">
          {renderedItalics}
        </strong>
      );
    }
    return <React.Fragment key={`normal-${baseKey}-${pIdx}`}>{renderedItalics}</React.Fragment>;
  });
}
