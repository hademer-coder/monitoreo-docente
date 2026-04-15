// import React from "react";

export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        background: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          padding: 24,
        }}
      >
        <h1 style={{ marginTop: 0 }}>Sistema de Monitoreo Docente</h1>
        <p>Colegio Adventista Túpac Amaru - Sede Jerusalén</p>

        <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
          <input
            type="text"
            placeholder="Buscar docente..."
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #cbd5e1",
            }}
          />

          <input
            type="date"
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #cbd5e1",
            }}
          />

          <textarea
            placeholder="Observaciones generales..."
            style={{
              minHeight: 120,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #cbd5e1",
            }}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid #111827",
                background: "#111827",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Guardar
            </button>

            <button
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                background: "#fff",
                color: "#111827",
                cursor: "pointer",
              }}
            >
              Descargar resumen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}