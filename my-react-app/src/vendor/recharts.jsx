import React from "react";

const ResponsiveContainer = ({ width = "100%", height = 300, children }) => (
  <div style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}>
    {children}
  </div>
);

const PieChart = ({ children }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      background: "#ffffff",
      padding: "12px",
      overflow: "auto",
    }}
  >
    {children}
  </div>
);

const Cell = () => null;

const Pie = ({ data = [], dataKey = "value", label }) => {
  const total = data.reduce((sum, item) => sum + (Number(item[dataKey]) || 0), 0);
  return (
    <div style={{ display: "grid", gap: "10px" }}>
      {data.map((item, index) => {
        const value = Number(item[dataKey]) || 0;
        const percent = total > 0 ? value / total : 0;
        const labelText =
          typeof label === "function"
            ? label({ name: item.name, percent })
            : `${item.name}: ${value}`;

        return (
          <div key={`${item.name}-${index}`}>
            <div style={{ fontWeight: 600, marginBottom: "4px", color: "#1f2937" }}>
              {labelText}
            </div>
            <div
              style={{
                width: "100%",
                height: "10px",
                borderRadius: "999px",
                backgroundColor: "#e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.max(0, Math.min(100, percent * 100))}%`,
                  height: "100%",
                  backgroundColor: "#066C98",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Tooltip = () => null;

export { Cell, Pie, PieChart, ResponsiveContainer, Tooltip };

