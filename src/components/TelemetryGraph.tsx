import { useMemo } from "react";

interface TelemetryGraphProps {
  data: number[];
  color: string;
  height?: number;
  width?: number;
  min?: number;
  max?: number;
}

export function TelemetryGraph({
  data,
  color,
  height = 40,
  width = 100,
  min = 0,
  max = 100,
}: TelemetryGraphProps) {
  const points = useMemo(() => {
    if (data.length === 0) return "";
    const stepX = width / (data.length - 1);

    return data
      .map((val, i) => {
        const x = i * stepX;
        // Normalize value to 0-1, then flip for SVG y-axis (0 is top)
        const normalizedVal =
          (Math.max(min, Math.min(max, val)) - min) / (max - min);
        const y = height - normalizedVal * height;
        return `${x},${y}`;
      })
      .join(" ");
  }, [data, height, width, min, max]);

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      {/* Grid lines */}
      <line
        x1="0"
        y1={height}
        x2={width}
        y2={height}
        stroke={color}
        strokeOpacity="0.2"
        strokeWidth="1"
      />
      <line
        x1="0"
        y1={0}
        x2={width}
        y2={0}
        stroke={color}
        strokeOpacity="0.1"
        strokeWidth="1"
      />

      {/* Graph line */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
        vectorEffect="non-scaling-stroke"
      />

      {/* Current value dot */}
      {data.length > 0 && (
        <circle
          cx={width}
          cy={
            height -
            ((Math.max(min, Math.min(max, data[data.length - 1])) - min) /
              (max - min)) *
              height
          }
          r="2"
          fill={color}
        />
      )}
    </svg>
  );
}
