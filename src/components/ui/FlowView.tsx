"use client";

import { useEffect, useMemo, useState } from "react";

import { useDateRange } from "@/contexts/DateRangeContext";
import { emptyStateClass, emptyStateTitleClass, loadingInlineClass, loadingSpinnerClass } from "@/lib/ui";

const NODE_WIDTH = 160;
const NODE_HEIGHT = 40;
const COL_GAP = 56;
const ROW_GAP = 10;

type FlowNode = {
  pathname: string;
  visitors: number;
  children?: FlowNode[];
};

type PositionedNode = {
  id: number;
  depth: number;
  pathname: string;
  visitors: number;
  parentId: number | null;
  x: number;
  y: number;
};

type FlowLink = {
  source: number;
  target: number;
  value: number;
};

type FlowResponse = {
  root?: FlowNode;
  totalVisitors: number;
  entryOptions?: Array<{ pathname: string; visitors: number }>;
};

function layoutTree(root?: FlowNode) {
  if (!root) return { nodes: [] as PositionedNode[], links: [] as FlowLink[], width: 0, height: 0 };

  const columns: number[][] = [];
  const nodes: PositionedNode[] = [];
  const links: FlowLink[] = [];
  let nextId = 0;

  function visit(node: FlowNode, depth: number, parentId: number | null) {
    const id = nextId++;
    if (!columns[depth]) columns[depth] = [];
    columns[depth].push(id);
    nodes.push({
      id,
      depth,
      pathname: node.pathname,
      visitors: node.visitors,
      parentId,
      x: 0,
      y: 0,
    });
    if (parentId !== null) {
      links.push({ source: parentId, target: id, value: node.visitors });
    }
    for (const child of node.children || []) visit(child, depth + 1, id);
  }

  visit(root, 0, null);

  const columnHeights = columns.map(
    (column) => column.length * NODE_HEIGHT + (column.length - 1) * ROW_GAP,
  );
  const totalHeight = Math.max(...columnHeights, NODE_HEIGHT);

  for (let depth = 0; depth < columns.length; depth += 1) {
    const column = columns[depth];
    const columnHeight = columnHeights[depth];
    const startY = (totalHeight - columnHeight) / 2;
    column.forEach((nodeId, index) => {
      const node = nodes[nodeId];
      node.x = depth * (NODE_WIDTH + COL_GAP);
      node.y = startY + index * (NODE_HEIGHT + ROW_GAP);
    });
  }

  const width = columns.length * NODE_WIDTH + (columns.length - 1) * COL_GAP;
  return { nodes, links, width, height: totalHeight };
}

export default function FlowView({ siteId }: { siteId?: string }) {
  const { getParams } = useDateRange();
  const [data, setData] = useState<FlowResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [root, setRoot] = useState<string | null>(null);
  const [convertersOnly, setConvertersOnly] = useState(false);
  const [hoverId, setHoverId] = useState<number | null>(null);

  useEffect(() => {
    if (!siteId) return;
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({
      ...getParams(),
      ...(root ? { root } : {}),
      ...(convertersOnly ? { converters: "1" } : {}),
    });
    fetch(`/api/analytics/${siteId}/flow?${params}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!cancelled) setData(payload as FlowResponse | null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [convertersOnly, getParams, root, siteId]);

  const layout = useMemo(() => layoutTree(data?.root), [data]);
  const maxVisitors = data?.root?.visitors || 1;

  if (loading) {
    return (
      <div className={loadingInlineClass}>
        <div className={loadingSpinnerClass} />
      </div>
    );
  }

  if (!data?.root) {
    return (
      <div className={emptyStateClass}>
        <h3 className={emptyStateTitleClass}>No flow yet</h3>
        <p>Need at least a few visitors with page-view history in this date range.</p>
      </div>
    );
  }

  const padding = 24;
  const svgWidth = layout.width + padding * 2;
  const svgHeight = layout.height + padding * 2;

  const childrenOf = new Map<number, number[]>();
  for (const link of layout.links) {
    if (!childrenOf.has(link.source)) childrenOf.set(link.source, []);
    childrenOf.get(link.source)?.push(link.target);
  }
  const parentOf = new Map<number, number>();
  for (const link of layout.links) parentOf.set(link.target, link.source);

  const highlighted = new Set<number>();
  if (hoverId !== null) {
    let current: number | undefined | null = hoverId;
    while (current !== undefined && current !== null) {
      highlighted.add(current);
      current = parentOf.get(current);
    }
    const stack = [hoverId];
    while (stack.length) {
      const nodeId = stack.pop();
      const children = childrenOf.get(nodeId as number) || [];
      for (const child of children) {
        highlighted.add(child);
        stack.push(child);
      }
    }
  }

  return (
    <div className="px-5 pt-[18px] pb-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="text-[12px] text-[var(--text-muted)]">
          <strong className="font-semibold text-[var(--text)]">{data.totalVisitors.toLocaleString()}</strong> visitors in range ·{" "}
          <strong className="font-semibold text-[var(--text)]">{data.root.visitors.toLocaleString()}</strong> reached{" "}
          <code className="ml-1 rounded-[4px] bg-[var(--bg-surface)] px-1.5 py-px font-mono text-[11px] text-[var(--text)]">
            {data.root.pathname}
          </code>
        </div>
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-1.5 text-[12px] text-[var(--text-secondary)]">
            <input
              type="checkbox"
              checked={convertersOnly}
              onChange={(event) => setConvertersOnly(event.target.checked)}
            />
            Converters only
          </label>
          {data.entryOptions?.length ? (
            <select
              className="rounded-[var(--radius)] border border-[var(--border)] bg-[var(--bg-input)] px-2.5 py-1.5 text-[12px] text-[var(--text)] outline-none focus:border-[var(--border-focus)]"
              value={data.root.pathname}
              onChange={(event) => setRoot(event.target.value)}
            >
              {data.entryOptions.map((option) => (
                <option key={option.pathname} value={option.pathname}>
                  {option.pathname} ({option.visitors})
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--border-light)] bg-[var(--bg)] p-2">
        <svg width={svgWidth} height={svgHeight} className="block">
          <g transform={`translate(${padding}, ${padding})`}>
            {layout.links.map((link, index) => {
              const source = layout.nodes[link.source];
              const target = layout.nodes[link.target];
              const x1 = source.x + NODE_WIDTH;
              const y1 = source.y + NODE_HEIGHT / 2;
              const x2 = target.x;
              const y2 = target.y + NODE_HEIGHT / 2;
              const cx = (x1 + x2) / 2;
              const path = `M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
              const strokeWidth = Math.max(1, (link.value / maxVisitors) * 12);
              const isHighlighted = highlighted.has(link.source) && highlighted.has(link.target);
              const dim = hoverId !== null && !isHighlighted;

              return (
                <path
                  key={index}
                  d={path}
                  fill="none"
                  stroke="var(--accent)"
                  strokeOpacity={dim ? 0.08 : isHighlighted ? 0.55 : 0.25}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
              );
            })}

            {layout.nodes.map((node) => {
              const isHighlighted = highlighted.has(node.id);
              const dim = hoverId !== null && !isHighlighted;
              const widthPercent = (node.visitors / maxVisitors) * 100;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoverId(node.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => setRoot(node.pathname)}
                  style={{
                    cursor: "pointer",
                    opacity: dim ? 0.4 : 1,
                    transition: "opacity 0.15s",
                  }}
                >
                  <rect
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    rx={5}
                    fill="var(--bg-card)"
                    stroke={isHighlighted ? "var(--accent)" : "var(--border)"}
                    strokeWidth={isHighlighted ? 1.25 : 1}
                  />
                  <rect
                    x={0}
                    y={NODE_HEIGHT - 2}
                    width={(NODE_WIDTH * widthPercent) / 100}
                    height={2}
                    rx={1}
                    fill="var(--accent)"
                    opacity={0.6}
                  />
                  <foreignObject x={8} y={4} width={NODE_WIDTH - 16} height={NODE_HEIGHT - 8}>
                    <div className="pointer-events-none flex h-full flex-col justify-center">
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[10px] leading-[1.2] text-[var(--text)]">
                        {node.pathname}
                      </div>
                      <div className="mt-0.5 flex items-baseline gap-1 [font-variant-numeric:tabular-nums]">
                        <strong className="text-[11px] font-semibold text-[var(--text-heading)]">
                          {node.visitors.toLocaleString()}
                        </strong>
                        <span className="text-[8px] tracking-[0.05em] text-[var(--text-muted)] uppercase">
                          visitors
                        </span>
                      </div>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="mt-3 text-center text-[11px] text-[var(--text-muted)]">
        Click any node to make it the new starting point. Hover to trace flow.
      </div>
    </div>
  );
}
