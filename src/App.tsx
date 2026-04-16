import { useEffect, useMemo, useState, type CSSProperties } from "react";
import * as XLSX from "xlsx";

type Docente = {
  id: number;
  nombre: string;
  grado: string;
};

type DatosVisita = {
  fecha: string;
  hora: string;
  area: string;
  sesion: string;
  observador: string;
  observacionesGenerales: string;
};

type CriterioBase = {
  id: string;
  criterio: string;
  categoria: string;
  aspectos: string[];
  niveles: {
    AD: string;
    A: string;
    B: string;
    C: string;
  };
};

type CriterioEvaluado = {
  id: string;
  criterio: string;
  categoria: string;
  puntaje: number;
  letra: string;
  nivel: string;
};

type VistaActiva = "evaluacion" | "resumen" | "grafico" | "historial";

type Credenciales = {
  usuario: string;
  clave: string;
};

type MonitoreoDocente = {
  datosVisita: DatosVisita;
  puntajes: Record<string, number>;
  retroalimentacion: string;
};

type Registros = Record<number, Record<number, MonitoreoDocente>>;

const USUARIOS = [
  { usuario: "ademer", clave: "CATA2026" },
  { usuario: "yessica", clave: "CATA2026" },
];

const DOCENTES_BASE: Docente[] = [
  { id: 1, nombre: "QUICANO CONDORI KATY PAOLA", grado: "Inicial" },
  { id: 2, nombre: "SANCA COA ALVITH NINOSKA", grado: "1.º Primaria" },
  { id: 3, nombre: "ARPASI CHAHUARES NELIDA", grado: "2.º Primaria" },
  { id: 4, nombre: "MAMANI TICONA ELVIA FRIDA", grado: "3.º Primaria" },
  { id: 5, nombre: "PULLUYQUERI ITO YESICA MARLENI", grado: "4.º Primaria" },
  { id: 6, nombre: "ALIAGA SALCEDO ELISA", grado: "5.º Primaria" },
  { id: 7, nombre: "JUAREZ LUQUE CARLOS", grado: "6.º Primaria" },
];

const MONITOREOS = [1, 2, 3, 4, 5];

const niveles = [
  { valor: 1, etiqueta: "En inicio", letra: "C" },
  { valor: 2, etiqueta: "En proceso", letra: "B" },
  { valor: 3, etiqueta: "Logro esperado", letra: "A" },
  { valor: 4, etiqueta: "Logro destacado", letra: "AD" },
];

const RUBRICA_BASE: CriterioBase[] = [
  {
    id: "planificacion_1",
    criterio: "Planifica y diseña secuencias de aprendizaje",
    categoria: "PLANIFICACIÓN",
    aspectos: [
      "Alineación al modelo educativo y curricular.",
      "Coherencia entre competencia, capacidad, desempeño, criterio y evidencia.",
      "Diseño de evidencias de aprendizaje.",
      "Secuencia de momentos pedagógicos.",
    ],
    niveles: {
      AD: "La planificación es clara, pertinente, alineada y presenta una secuencia pedagógica sólida con evidencias bien definidas.",
      A: "La planificación muestra alineación adecuada y coherencia entre los elementos principales de la sesión.",
      B: "La planificación presenta coherencia parcial y algunos vacíos en secuencia, criterios o evidencias.",
      C: "La planificación no evidencia alineación clara ni coherencia suficiente entre sus elementos.",
    },
  },
  {
    id: "planificacion_2",
    criterio: "Diseña experiencias y recursos evaluativos",
    categoria: "PLANIFICACIÓN",
    aspectos: [
      "Propósito de sesión significativo.",
      "Adecuación de recursos didácticos.",
    ],
    niveles: {
      AD: "El propósito es claro, motivador y contextualizado; los recursos son diversos, inclusivos y óptimos para evaluar.",
      A: "Formula un propósito claro y significativo; selecciona recursos adecuados y alineados.",
      B: "El propósito es vago o mal comunicado; los recursos son parcialmente adecuados.",
      C: "No formula propósito relevante ni recursos alineados.",
    },
  },
  {
    id: "ensenanza_1",
    criterio: "Involucra activamente a los estudiantes en el proceso de aprendizaje",
    categoria: "ENSEÑANZA",
    aspectos: [
      "Acciones para promover el interés.",
      "Proporción de estudiantes involucrados.",
      "Comprensión del sentido de lo que se aprende.",
    ],
    niveles: {
      AD: "Involucra activamente a casi todos los estudiantes, recupera a quienes se desconectan y fortalece el sentido del aprendizaje.",
      A: "Involucra a la gran mayoría con oportunidades pertinentes de participación.",
      B: "Involucra solo a una parte del grupo y no sostiene el interés de forma constante.",
      C: "No genera suficientes oportunidades de participación ni compromiso con el aprendizaje.",
    },
  },
  {
    id: "ensenanza_2",
    criterio: "Promueve el razonamiento, la creatividad y/o el pensamiento crítico",
    categoria: "ENSEÑANZA",
    aspectos: [
      "Actividades e interacciones que promueven razonamiento, creatividad o pensamiento crítico.",
    ],
    niveles: {
      AD: "Promueve de manera continua y desafiante el razonamiento, la creatividad y el pensamiento crítico.",
      A: "Promueve efectivamente el razonamiento o pensamiento crítico en momentos relevantes de la sesión.",
      B: "Intenta promoverlo, pero de manera superficial o con poco reto cognitivo.",
      C: "Se limita a actividades repetitivas o memorísticas.",
    },
  },
  {
    id: "aprendizaje_1",
    criterio:
      "Evalúa el progreso de los aprendizajes para retroalimentar a los estudiantes y adecuar su enseñanza",
    categoria: "APRENDIZAJE",
    aspectos: [
      "Monitoreo del trabajo y avances.",
      "Calidad de la retroalimentación.",
    ],
    niveles: {
      AD: "Monitorea activamente y brinda retroalimentación reflexiva y oportuna que transforma el aprendizaje.",
      A: "Monitorea y brinda retroalimentación descriptiva pertinente o ajusta su enseñanza.",
      B: "Monitorea de forma parcial y brinda retroalimentación elemental.",
      C: "Monitorea poco o nada y no brinda retroalimentación útil.",
    },
  },
  {
    id: "sociedad_1",
    criterio: "Propicia un ambiente de respeto y proximidad",
    categoria: "SOCIEDAD",
    aspectos: [
      "Trato respetuoso.",
      "Cordialidad y calidez.",
      "Empatía ante necesidades afectivas o físicas.",
    ],
    niveles: {
      AD: "Mantiene un trato siempre respetuoso, cálido y empático, e interviene oportunamente ante faltas de respeto.",
      A: "Genera un clima respetuoso y cercano de forma consistente.",
      B: "Mantiene respeto básico, pero con poca cercanía o calidez.",
      C: "No alcanza condiciones mínimas de respeto o no interviene adecuadamente.",
    },
  },
  {
    id: "sociedad_2",
    criterio: "Regula positivamente el comportamiento de los estudiantes",
    categoria: "SOCIEDAD",
    aspectos: [
      "Mecanismos formativos, de control externo o maltrato.",
      "Eficacia para sostener la continuidad de la sesión.",
    ],
    niveles: {
      AD: "Regula de manera formativa, eficaz y sostenida sin afectar la continuidad de la sesión.",
      A: "Usa mecanismos mayormente formativos y logra regular adecuadamente.",
      B: "Regula con eficacia limitada o con estrategias poco consistentes.",
      C: "Predominan mecanismos poco formativos o ineficaces.",
    },
  },
  {
    id: "tecnologia_1",
    criterio: "Gestiona espacios y recursos didácticos",
    categoria: "TECNOLOGÍA",
    aspectos: [
      "Gestión intencional del espacio.",
      "Preparación y disponibilidad de recursos.",
      "Dominio de equipos tecnológicos.",
    ],
    niveles: {
      AD: "Organiza espacio y recursos de forma óptima y demuestra dominio técnico-pedagógico alto.",
      A: "Gestiona adecuadamente el espacio, los materiales y los equipos necesarios.",
      B: "La organización es parcial y algunos recursos o equipos limitan la sesión.",
      C: "No organiza adecuadamente el espacio ni los recursos para el aprendizaje.",
    },
  },
  {
    id: "tecnologia_2",
    criterio: "Integra tecnología en el proceso de aprendizaje",
    categoria: "TECNOLOGÍA",
    aspectos: [
      "Uso de plataforma educativa.",
      "Herramientas tecnológicas interactivas.",
      "Uso de software de gestión.",
    ],
    niveles: {
      AD: "Integra tecnología de manera intencional, interactiva y pedagógicamente potente.",
      A: "Usa herramientas tecnológicas pertinentes al aprendizaje y la gestión.",
      B: "El uso de la tecnología es esporádico o poco articulado.",
      C: "No integra tecnología con propósito pedagógico.",
    },
  },
];

function getInitialDatosVisita(): DatosVisita {
  return {
    fecha: "",
    hora: "",
    area: "",
    sesion: "",
    observador: "LIC. VÁSQUEZ CCALLA YESSICA",
    observacionesGenerales: "",
  };
}

function getInitialMonitoreo(): MonitoreoDocente {
  return {
    datosVisita: getInitialDatosVisita(),
    puntajes: {},
    retroalimentacion: "",
  };
}

function obtenerEstado(promedio: number) {
  if (promedio >= 3.5) return { texto: "Logro destacado", clase: "success" };
  if (promedio >= 2.5) return { texto: "Logro esperado", clase: "primary" };
  if (promedio >= 1.5) return { texto: "En proceso", clase: "warning" };
  return { texto: "En inicio", clase: "danger" };
}

function obtenerEscala(promedio: number) {
  if (promedio >= 3.5) return { letra: "AD", texto: "Logro destacado" };
  if (promedio >= 2.5) return { letra: "A", texto: "Logro esperado" };
  if (promedio >= 1.5) return { letra: "B", texto: "En proceso" };
  return { letra: "C", texto: "En inicio" };
}

function obtenerNivelPorPuntaje(puntaje: number) {
  if (puntaje === 4) return { letra: "AD", nivel: "Logro destacado" };
  if (puntaje === 3) return { letra: "A", nivel: "Logro esperado" };
  if (puntaje === 2) return { letra: "B", nivel: "En proceso" };
  return { letra: "C", nivel: "En inicio" };
}

function agruparPorCategoria(lista: CriterioEvaluado[]) {
  const grupos: Record<string, CriterioEvaluado[]> = {};
  lista.forEach((item) => {
    if (!grupos[item.categoria]) grupos[item.categoria] = [];
    grupos[item.categoria].push(item);
  });
  return grupos;
}

function promedioMonitoreo(puntajes: Record<string, number>) {
  const valores = RUBRICA_BASE.map((r) => puntajes[r.id] ?? 1);
  return valores.reduce((a, b) => a + b, 0) / valores.length;
}

function descargarTexto(contenido: string, nombre: string) {
  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

function limpiarNombreHoja(nombre: string) {
  return nombre.replace(/[\\/?*\[\]:]/g, "").slice(0, 31);
}

function cardStyle(): CSSProperties {
  return {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
  };
}

function sectionTitleStyle(): CSSProperties {
  return {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
  };
}

function buttonStyle(kind: "solid" | "outline" = "solid"): CSSProperties {
  return kind === "solid"
    ? {
        padding: "10px 16px",
        borderRadius: 14,
        border: "1px solid #0f172a",
        background: "#0f172a",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 600,
      }
    : {
        padding: "10px 16px",
        borderRadius: 14,
        border: "1px solid #cbd5e1",
        background: "#ffffff",
        color: "#0f172a",
        cursor: "pointer",
        fontWeight: 600,
      };
}

function inputStyle(): CSSProperties {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    fontSize: 14,
    background: "#ffffff",
  };
}

function textareaStyle(minHeight = 120): CSSProperties {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    fontSize: 14,
    minHeight,
    resize: "vertical",
    background: "#ffffff",
  };
}

function badgeStyle(kind: string = "default"): CSSProperties {
  if (kind === "success") return { background: "#dcfce7", color: "#166534" };
  if (kind === "primary") return { background: "#dbeafe", color: "#1d4ed8" };
  if (kind === "warning") return { background: "#fef3c7", color: "#92400e" };
  if (kind === "danger") return { background: "#fee2e2", color: "#991b1b" };
  if (kind === "outline") {
    return { background: "#ffffff", color: "#334155", border: "1px solid #cbd5e1" };
  }
  return { background: "#f1f5f9", color: "#334155" };
}

function colorNivel(letra: string, activo = false): CSSProperties {
  const coloresActivos = {
    AD: {
      fondo: "#dcfce7",
      borde: "#22c55e",
      texto: "#166534",
    },
    A: {
      fondo: "#dbeafe",
      borde: "#3b82f6",
      texto: "#1d4ed8",
    },
    B: {
      fondo: "#fef3c7",
      borde: "#f59e0b",
      texto: "#92400e",
    },
    C: {
      fondo: "#fee2e2",
      borde: "#ef4444",
      texto: "#991b1b",
    },
  };

  const neutro = {
    fondo: "#ffffff",
    borde: "#cbd5e1",
    texto: "#0f172a",
  };

  const c = coloresActivos[letra as keyof typeof coloresActivos] || coloresActivos.C;
  const estilo = activo ? c : neutro;

  return {
    borderRadius: 14,
    padding: 12,
    textAlign: "left",
    border: `2px solid ${estilo.borde}`,
    background: estilo.fondo,
    color: estilo.texto,
    cursor: "pointer",
    fontWeight: 600,
  };
}

function MiniChart({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
}) {
  const width = 720;
  const height = 260;
  const padding = 36;
  const maxValue = 4;
  const minValue = 1;

  const points = values.map((value, index) => {
    const x =
      labels.length === 1
        ? width / 2
        : padding + (index * (width - padding * 2)) / (labels.length - 1);
    const y =
      height - padding - ((value - minValue) / (maxValue - minValue)) * (height - padding * 2);
    return { x, y };
  });

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={width} height={height} style={{ background: "#fff", borderRadius: 12 }}>
        {[1, 2, 3, 4].map((nivel) => {
          const y =
            height - padding - ((nivel - minValue) / (maxValue - minValue)) * (height - padding * 2);
          return (
            <g key={nivel}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e2e8f0" />
              <text x={10} y={y + 4} fontSize="12" fill="#64748b">
                {nivel}
              </text>
            </g>
          );
        })}

        {labels.map((label, index) => {
          const x =
            labels.length === 1
              ? width / 2
              : padding + (index * (width - padding * 2)) / (labels.length - 1);
          return (
            <text key={label} x={x} y={height - 8} textAnchor="middle" fontSize="12" fill="#475569">
              {label}
            </text>
          );
        })}

        {points.length > 1 && (
          <polyline
            fill="none"
            stroke="#7c3aed"
            strokeWidth="3"
            points={points.map((p) => `${p.x},${p.y}`).join(" ")}
          />
        )}

        {points.map((point, index) => (
          <g key={`${labels[index]}-${values[index]}`}>
            <circle cx={point.x} cy={point.y} r={5} fill="#7c3aed" />
            <text x={point.x} y={point.y - 10} textAnchor="middle" fontSize="12" fill="#0f172a">
              {values[index].toFixed(2)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function App() {
  const [autenticado, setAutenticado] = useState(
    typeof window !== "undefined" && localStorage.getItem("auth-monitoreo") === "ok"
  );
  const [credenciales, setCredenciales] = useState<Credenciales>({ usuario: "", clave: "" });
  const [errorLogin, setErrorLogin] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [docentes] = useState<Docente[]>(DOCENTES_BASE);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<Docente>(DOCENTES_BASE[0]);
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>("evaluacion");
  const [monitoreoActivo, setMonitoreoActivo] = useState(1);
  const [monitoreosPromedio, setMonitoreosPromedio] = useState<number[]>([1, 2, 3, 4, 5]);
  const [monitoreosGrafico, setMonitoreosGrafico] = useState<number[]>([1, 2, 3, 4, 5]);
  const [criterioAbierto, setCriterioAbierto] = useState<string | null>(null);

  const [registros, setRegistros] = useState<Registros>(() => {
    if (typeof window === "undefined") return {};
    const raw = localStorage.getItem("registros-monitoreo");
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Registros;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem("registros-monitoreo", JSON.stringify(registros));
  }, [registros]);

  const usuarioActivo =
    typeof window !== "undefined" ? localStorage.getItem("usuario-activo") || "" : "";

  const iniciarSesion = () => {
    const usuarioValido = USUARIOS.find(
      (u) => u.usuario === credenciales.usuario && u.clave === credenciales.clave
    );

    if (usuarioValido) {
      localStorage.setItem("auth-monitoreo", "ok");
      localStorage.setItem("usuario-activo", usuarioValido.usuario);
      setAutenticado(true);
      setErrorLogin("");
    } else {
      setErrorLogin("Usuario o contraseña incorrectos.");
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("auth-monitoreo");
    localStorage.removeItem("usuario-activo");
    setAutenticado(false);
    setCredenciales({ usuario: "", clave: "" });
  };

  const docentesFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return docentes.filter(
      (d) => d.nombre.toLowerCase().includes(q) || d.grado.toLowerCase().includes(q)
    );
  }, [busqueda, docentes]);

  const registroActual: MonitoreoDocente =
    registros[docenteSeleccionado.id]?.[monitoreoActivo] || getInitialMonitoreo();

  const datosVisita = registroActual.datosVisita;
  const evaluacionActual = registroActual.puntajes;
  const retroalimentacionActual = registroActual.retroalimentacion || "";

  const promedioActual = useMemo(() => promedioMonitoreo(evaluacionActual), [evaluacionActual]);
  const estadoActual = obtenerEstado(promedioActual);
  const escalaActual = obtenerEscala(promedioActual);

  const actualizarDatosVisita = (campo: keyof DatosVisita, valor: string) => {
    setRegistros((prev) => ({
      ...prev,
      [docenteSeleccionado.id]: {
        ...(prev[docenteSeleccionado.id] || {}),
        [monitoreoActivo]: {
          datosVisita: {
            ...(prev[docenteSeleccionado.id]?.[monitoreoActivo]?.datosVisita || getInitialDatosVisita()),
            [campo]: valor,
          },
          puntajes: prev[docenteSeleccionado.id]?.[monitoreoActivo]?.puntajes || {},
          retroalimentacion:
            prev[docenteSeleccionado.id]?.[monitoreoActivo]?.retroalimentacion || "",
        },
      },
    }));
  };

  const actualizarPuntaje = (criterioId: string, valor: number) => {
    setRegistros((prev) => ({
      ...prev,
      [docenteSeleccionado.id]: {
        ...(prev[docenteSeleccionado.id] || {}),
        [monitoreoActivo]: {
          datosVisita:
            prev[docenteSeleccionado.id]?.[monitoreoActivo]?.datosVisita || getInitialDatosVisita(),
          puntajes: {
            ...(prev[docenteSeleccionado.id]?.[monitoreoActivo]?.puntajes || {}),
            [criterioId]: valor,
          },
          retroalimentacion:
            prev[docenteSeleccionado.id]?.[monitoreoActivo]?.retroalimentacion || "",
        },
      },
    }));
  };

  const actualizarRetroalimentacion = (valor: string) => {
    setRegistros((prev) => ({
      ...prev,
      [docenteSeleccionado.id]: {
        ...(prev[docenteSeleccionado.id] || {}),
        [monitoreoActivo]: {
          datosVisita:
            prev[docenteSeleccionado.id]?.[monitoreoActivo]?.datosVisita || getInitialDatosVisita(),
          puntajes: prev[docenteSeleccionado.id]?.[monitoreoActivo]?.puntajes || {},
          retroalimentacion: valor,
        },
      },
    }));
  };

  const reiniciarMonitoreoActual = () => {
    setRegistros((prev) => ({
      ...prev,
      [docenteSeleccionado.id]: {
        ...(prev[docenteSeleccionado.id] || {}),
        [monitoreoActivo]: getInitialMonitoreo(),
      },
    }));
  };

  const resumenDocentes = useMemo(() => {
    return docentes.map((docente) => {
      const promediosPorMonitoreo = MONITOREOS.map((n) => {
        const puntajes = registros[docente.id]?.[n]?.puntajes || {};
        return promedioMonitoreo(puntajes);
      });

      const monitoreosUsados = MONITOREOS.filter((n) => monitoreosPromedio.includes(n));
      const promedioGeneral =
        monitoreosUsados.reduce((acc, n) => acc + promediosPorMonitoreo[n - 1], 0) /
        Math.max(monitoreosUsados.length, 1);

      return {
        ...docente,
        promediosPorMonitoreo,
        promedioGeneral,
        escala: obtenerEscala(promedioGeneral),
      };
    });
  }, [docentes, registros, monitoreosPromedio]);

  const historialDocente = useMemo(() => {
    return MONITOREOS.map((n) => {
      const registro = registros[docenteSeleccionado.id]?.[n] || getInitialMonitoreo();
      const promedio = promedioMonitoreo(registro.puntajes);
      const escala = obtenerEscala(promedio);
      return {
        monitoreo: n,
        datosVisita: registro.datosVisita,
        puntajes: registro.puntajes,
        retroalimentacion: registro.retroalimentacion,
        promedio,
        escala,
      };
    });
  }, [docenteSeleccionado.id, registros]);

  const datosGrafico = useMemo(() => {
    const items = MONITOREOS.filter((n) => monitoreosGrafico.includes(n)).map((n) => {
      const puntajes = registros[docenteSeleccionado.id]?.[n]?.puntajes || {};
      return {
        label: `M${n}`,
        value: promedioMonitoreo(puntajes),
      };
    });

    return {
      labels: items.map((i) => i.label),
      values: items.map((i) => i.value),
    };
  }, [docenteSeleccionado.id, monitoreosGrafico, registros]);

  const toggleSeleccion = (
    valor: number,
    setter: React.Dispatch<React.SetStateAction<number[]>>
  ) => {
    setter((prev) => {
      if (prev.includes(valor)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== valor);
      }
      return [...prev, valor].sort((a, b) => a - b);
    });
  };

  const guardarLocal = () => {
    localStorage.setItem("registros-monitoreo", JSON.stringify(registros));
    alert("Registros guardados en este navegador.");
  };

  const generarRetroalimentacion = () => {
    const fecha = datosVisita.fecha || "No registrada";
    const docente = docenteSeleccionado.nombre;
    const grado = docenteSeleccionado.grado;
    const area = datosVisita.area || "No registrada";
    const sesion = datosVisita.sesion || "No registrada";
    const observaciones =
      datosVisita.observacionesGenerales.trim() ||
      "Durante el monitoreo se evidenció el desarrollo de la sesión con disposición favorable hacia la mejora continua de la práctica pedagógica.";

    const criteriosEvaluados: CriterioEvaluado[] = RUBRICA_BASE.map((r) => {
      const puntaje = evaluacionActual[r.id] ?? 1;
      const nivelData = obtenerNivelPorPuntaje(puntaje);
      return {
        id: r.id,
        criterio: r.criterio,
        categoria: r.categoria,
        puntaje,
        letra: nivelData.letra,
        nivel: nivelData.nivel,
      };
    });

    const fortalezasLista = criteriosEvaluados.filter((c) => c.puntaje >= 3);
    const mejorasLista = criteriosEvaluados.filter((c) => c.puntaje < 3);

    const fortalezas = agruparPorCategoria(fortalezasLista);
    const mejoras = agruparPorCategoria(mejorasLista);

    const predominio =
      escalaActual.letra === "AD"
        ? "predominio de logros destacados"
        : escalaActual.letra === "A"
          ? "predominio de logros esperados"
          : escalaActual.letra === "B"
            ? "predominio de criterios en proceso"
            : "predominio de criterios en inicio";

    const sintesis =
      "El análisis de la rúbrica evidencia un desempeño general ubicado en el nivel " +
      escalaActual.texto.toLowerCase() +
      ", con " +
      predominio +
      ". Se observan avances en la conducción del proceso pedagógico; sin embargo, aún existen criterios que requieren fortalecimiento para consolidar una práctica más consistente, reflexiva y centrada en el logro de aprendizajes de calidad.";

    const fortalezasTexto = Object.keys(fortalezas).length
      ? Object.entries(fortalezas)
          .map(
            ([categoria, items]) =>
              "En la dimensión " +
              categoria +
              ", el docente evidencia logros en los siguientes aspectos:\n" +
              items.map((i) => "- " + i.criterio).join("\n")
          )
          .join("\n\n")
      : "- En esta visita aún no se evidencian criterios en nivel esperado o destacado.";

    const mejorasTexto = Object.keys(mejoras).length
      ? Object.entries(mejoras)
          .map(
            ([categoria, items]) =>
              "En la dimensión " +
              categoria +
              ", se recomienda fortalecer los siguientes aspectos:\n" +
              items.map((i) => "- " + i.criterio).join("\n")
          )
          .join("\n\n")
      : "- No se identifican criterios prioritarios en proceso o en inicio.";

    const preguntasReflexivas = mejorasLista.length
      ? mejorasLista
          .slice(0, 3)
          .map(
            (m) =>
              "- ¿Qué ajustes podrías realizar en el criterio '" +
              m.criterio +
              "' para avanzar desde el nivel " +
              m.nivel.toLowerCase() +
              " hacia un desempeño esperado o destacado?"
          )
          .join("\n")
      : "- ¿Qué estrategias podrías mantener y sistematizar para seguir consolidando tus fortalezas?";

    const compromisosTexto = mejorasLista.length
      ? mejorasLista
          .map((m) => "- Fortalecer el criterio '" + m.criterio + "' en las próximas sesiones.")
          .join("\n")
      : "- Mantener y sistematizar las buenas prácticas evidenciadas.";

    const detalleCriterios = criteriosEvaluados
      .map(
        (c, index) =>
          `${index + 1}. ${c.criterio} | Categoría: ${c.categoria} | Puntaje: ${c.puntaje} | Nivel: ${c.letra} - ${c.nivel}`
      )
      .join("\n");

    const texto = `RETROALIMENTACIÓN PEDAGÓGICA - MONITOREO ${monitoreoActivo}

Docente: ${docente}
Área: ${area}
Grado: ${grado}
Sesión: ${sesion}
Fecha: ${fecha}
Acompañante pedagógico: ${datosVisita.observador}
Usuario activo: ${usuarioActivo}

Síntesis del desempeño
${sintesis}

Fortalezas pedagógicas
${fortalezasTexto}

Aspectos por mejorar
${mejorasTexto}

Preguntas reflexivas
${preguntasReflexivas}

Compromisos de mejora
${compromisosTexto}

Detalle de resultados por criterio
${detalleCriterios}

Observaciones generales
${observaciones}`;

    setRegistros((prev) => ({
      ...prev,
      [docenteSeleccionado.id]: {
        ...(prev[docenteSeleccionado.id] || {}),
        [monitoreoActivo]: {
          datosVisita:
            prev[docenteSeleccionado.id]?.[monitoreoActivo]?.datosVisita || getInitialDatosVisita(),
          puntajes: prev[docenteSeleccionado.id]?.[monitoreoActivo]?.puntajes || {},
          retroalimentacion: texto,
        },
      },
    }));

    alert(`Retroalimentación generada y guardada en Monitoreo ${monitoreoActivo}.`);
  };

  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();

    const resumenRows: (string | number)[][] = [
      [
        "Docente",
        "Grado",
        "Promedio M1",
        "Promedio M2",
        "Promedio M3",
        "Promedio M4",
        "Promedio M5",
        "Monitoreos promediados",
        "Promedio general",
        "Desempeño final",
      ],
    ];

    resumenDocentes.forEach((docente) => {
      resumenRows.push([
        docente.nombre,
        docente.grado,
        Number(docente.promediosPorMonitoreo[0].toFixed(2)),
        Number(docente.promediosPorMonitoreo[1].toFixed(2)),
        Number(docente.promediosPorMonitoreo[2].toFixed(2)),
        Number(docente.promediosPorMonitoreo[3].toFixed(2)),
        Number(docente.promediosPorMonitoreo[4].toFixed(2)),
        monitoreosPromedio.join(", "),
        Number(docente.promedioGeneral.toFixed(2)),
        `${docente.escala.letra} - ${docente.escala.texto}`,
      ]);
    });

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(resumenRows),
      "Resumen General"
    );

    docentes.forEach((docente) => {
      const rows: (string | number)[][] = [
        ["Docente", docente.nombre],
        ["Grado", docente.grado],
        ["Monitoreos promediados", monitoreosPromedio.join(", ")],
        [],
      ];

      MONITOREOS.forEach((n) => {
        const registro = registros[docente.id]?.[n] || getInitialMonitoreo();
        const promedio = promedioMonitoreo(registro.puntajes);
        const escala = obtenerEscala(promedio);

        rows.push([`Monitoreo ${n}`]);
        rows.push(["Fecha", registro.datosVisita.fecha || "-"]);
        rows.push(["Hora", registro.datosVisita.hora || "-"]);
        rows.push(["Área", registro.datosVisita.area || "-"]);
        rows.push(["Sesión", registro.datosVisita.sesion || "-"]);
        rows.push(["Acompañante pedagógico", registro.datosVisita.observador || "-"]);
        rows.push(["Observaciones", registro.datosVisita.observacionesGenerales || "-"]);
        rows.push(["Promedio", Number(promedio.toFixed(2))]);
        rows.push(["Desempeño", `${escala.letra} - ${escala.texto}`]);
        rows.push(["Retroalimentación", registro.retroalimentacion || "-"]);
        rows.push([]);
        rows.push(["Criterio", "Categoría", "Puntaje", "Nivel"]);
        RUBRICA_BASE.forEach((r) => {
          const puntaje = registro.puntajes[r.id] ?? 1;
          const nivel = obtenerNivelPorPuntaje(puntaje);
          rows.push([r.criterio, r.categoria, puntaje, `${nivel.letra} - ${nivel.nivel}`]);
        });
        rows.push([]);
      });

      const promediosSeleccionados = monitoreosPromedio.map((n) =>
        promedioMonitoreo(registros[docente.id]?.[n]?.puntajes || {})
      );
      const promedioFinal =
        promediosSeleccionados.reduce((a, b) => a + b, 0) /
        Math.max(promediosSeleccionados.length, 1);
      const escalaFinal = obtenerEscala(promedioFinal);

      rows.push(["Promedio final configurable", Number(promedioFinal.toFixed(2))]);
      rows.push(["Desempeño final configurable", `${escalaFinal.letra} - ${escalaFinal.texto}`]);

      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(rows),
        limpiarNombreHoja(docente.nombre)
      );
    });

    XLSX.writeFile(wb, "Monitoreo_Docente_CATA.xlsx");
  };

  if (!autenticado) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: 16,
          fontFamily: "Arial, sans-serif",
          color: "#0f172a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 380,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 18,
            padding: 24,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
          }}
        >
          <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 26 }}>Acceso al sistema</h1>
          <p style={{ marginTop: 0, color: "#64748b", marginBottom: 20 }}>
            Ingrese su usuario y contraseña para continuar.
          </p>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Usuario</label>
            <input
              type="text"
              value={credenciales.usuario}
              onChange={(e) => setCredenciales({ ...credenciales, usuario: e.target.value })}
              placeholder="Ingrese su usuario"
              style={inputStyle()}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Contraseña</label>
            <input
              type="password"
              value={credenciales.clave}
              onChange={(e) => setCredenciales({ ...credenciales, clave: e.target.value })}
              placeholder="Ingrese su contraseña"
              style={inputStyle()}
            />
          </div>

          {errorLogin && (
            <div
              style={{
                marginBottom: 14,
                padding: 10,
                borderRadius: 10,
                background: "#fee2e2",
                color: "#991b1b",
                fontSize: 14,
              }}
            >
              {errorLogin}
            </div>
          )}

          <button
            onClick={iniciarSesion}
            style={{ ...buttonStyle("solid"), width: "100%" }}
          >
            Iniciar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: 16,
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 30,
            textAlign: "center",
            background: "#ffffff",
            borderRadius: 20,
            padding: "30px 20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          }}
        >
          <img
            src="/logo-cata.png"
            alt="Logo CATA"
            style={{
              width: 130,
              height: "auto",
              marginBottom: 12,
              objectFit: "contain",
            }}
          />

          <h1
            style={{
              fontSize: 30,
              fontWeight: 900,
              marginBottom: 6,
              color: "#0f172a",
              letterSpacing: 0.5,
            }}
          >
            SISTEMA DE MONITOREO Y ACOMPAÑAMIENTO PEDAGÓGICO
          </h1>

          <p
            style={{
              margin: 0,
              color: "#334155",
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            COLEGIO ADVENTISTA TÚPAC AMARU - SEDE JERUSALÉN
          </p>

          <p
            style={{
              margin: "6px 0 0",
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Por ADEMER HUAHUACONDORI ARANDA - Diseñador de Aprendizajes
          </p>

          <p
            style={{
              margin: "6px 0 0",
              color: "#94a3b8",
              fontSize: 12,
            }}
          >
            Usuario activo: {usuarioActivo}
          </p>

          <div style={{ marginTop: 14 }}>
            <button
              onClick={cerrarSesion}
              style={{
                borderRadius: 12,
                padding: "8px 16px",
                border: "1px solid #cbd5e1",
                background: "#f8fafc",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 18 }}>
          <button
            onClick={() => setVistaActiva("evaluacion")}
            style={buttonStyle(vistaActiva === "evaluacion" ? "solid" : "outline")}
          >
            Evaluación docente
          </button>
          <button
            onClick={() => setVistaActiva("resumen")}
            style={buttonStyle(vistaActiva === "resumen" ? "solid" : "outline")}
          >
            Resumen general
          </button>
          <button
            onClick={() => setVistaActiva("grafico")}
            style={buttonStyle(vistaActiva === "grafico" ? "solid" : "outline")}
          >
            Gráfico de desempeño
          </button>
          <button
            onClick={() => setVistaActiva("historial")}
            style={buttonStyle(vistaActiva === "historial" ? "solid" : "outline")}
          >
            Historial por docente
          </button>
          <button onClick={exportarExcel} style={buttonStyle("solid")}>
            Exportar a Excel
          </button>
        </div>

        <div style={{ ...cardStyle(), padding: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontWeight: 700 }}>Monitoreos que se promedian:</span>
            {MONITOREOS.map((n) => (
              <button
                key={n}
                onClick={() => toggleSeleccion(n, setMonitoreosPromedio)}
                style={buttonStyle(monitoreosPromedio.includes(n) ? "solid" : "outline")}
              >
                M{n}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "320px minmax(0, 1fr)",
            alignItems: "start",
          }}
        >
          <div style={{ ...cardStyle(), padding: 20 }}>
            <h3 style={{ ...sectionTitleStyle(), fontSize: 18, marginBottom: 16 }}>
              Lista de docentes
            </h3>

            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar docente..."
              style={inputStyle()}
            />

           <div style={{ marginTop: 16, maxHeight: 620, overflowY: "auto", paddingRight: 6 }}>
  {docentesFiltrados.map((docente) => {
    const activo = docenteSeleccionado.id === docente.id;

    const promediosDocente = MONITOREOS.map((n) =>
      promedioMonitoreo(registros[docente.id]?.[n]?.puntajes || {})
    );

    const promedioGeneralDocente =
      promediosDocente.reduce((a, b) => a + b, 0) / promediosDocente.length;

    const escalaDocente = obtenerEscala(promedioGeneralDocente);
    const estadoColor = badgeStyle(
      escalaDocente.letra === "AD"
        ? "success"
        : escalaDocente.letra === "A"
          ? "primary"
          : escalaDocente.letra === "B"
            ? "warning"
            : "danger"
    );

    return (
      <button
        key={docente.id}
        onClick={() => setDocenteSeleccionado(docente)}
        style={{
          width: "100%",
          textAlign: "left",
          borderRadius: 18,
          padding: 16,
          border: activo ? "2px solid #0f172a" : "1px solid #e2e8f0",
          background: "#ffffff",
          color: "#0f172a",
          marginBottom: 12,
          cursor: "pointer",
          boxShadow: activo
            ? "0 8px 24px rgba(15,23,42,0.12)"
            : "0 2px 8px rgba(15,23,42,0.06)",
          transform: activo ? "translateY(-1px)" : "none",
          transition: "all 0.2s ease",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.25 }}>
              👤 {docente.nombre}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "#64748b",
                fontWeight: 600,
              }}
            >
              🎓 {docente.grado}
            </div>

          <div
            style={{
              ...estadoColor,
              borderRadius: 999,
              padding: "8px 10px",
              fontSize: 12,
              fontWeight: 800,
              minWidth: 64,
              textAlign: "center",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {escalaDocente.letra}
          </div>
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            fontWeight: 700,
            color:
              escalaDocente.letra === "AD"
                ? "#166534"
                : escalaDocente.letra === "A"
                  ? "#1d4ed8"
                  : escalaDocente.letra === "B"
                    ? "#92400e"
                    : "#991b1b",
          }}
        >
          {escalaDocente.texto}
        </div>

        {activo && (
          <div
            style={{
              marginTop: 10,
              fontSize: 12,
              color: "#0f172a",
              fontWeight: 700,
            }}
          >
            Seleccionado
          </div>
        )}
      </button>
    );
  })}
</div>

          <div>
            {vistaActiva === "evaluacion" && (
              <div style={{ ...cardStyle(), padding: 20 }}>
                <h3 style={{ ...sectionTitleStyle(), fontSize: 18, marginBottom: 8 }}>
                  Evaluación docente
                </h3>

                <p style={{ color: "#475569", marginBottom: 16 }}>
                  Docente seleccionado: <strong>{docenteSeleccionado.nombre}</strong> |{" "}
                  {docenteSeleccionado.grado}
                </p>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: "block", marginBottom: 8, fontWeight: 700 }}>
                    Seleccione monitoreo
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {MONITOREOS.map((n) => (
                      <button
                        key={n}
                        onClick={() => setMonitoreoActivo(n)}
                        style={buttonStyle(monitoreoActivo === n ? "solid" : "outline")}
                      >
                        Monitoreo {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: 16,
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    marginBottom: 24,
                  }}
                >
                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Fecha</label>
                    <input
                      type="date"
                      value={datosVisita.fecha}
                      onChange={(e) => actualizarDatosVisita("fecha", e.target.value)}
                      style={inputStyle()}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Hora</label>
                    <input
                      type="time"
                      value={datosVisita.hora}
                      onChange={(e) => actualizarDatosVisita("hora", e.target.value)}
                      style={inputStyle()}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Área</label>
                    <input
                      value={datosVisita.area}
                      onChange={(e) => actualizarDatosVisita("area", e.target.value)}
                      placeholder="Ej. Comunicación"
                      style={inputStyle()}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
                      Nombre de la sesión
                    </label>
                    <input
                      value={datosVisita.sesion}
                      onChange={(e) => actualizarDatosVisita("sesion", e.target.value)}
                      placeholder="Ej. Comprensión lectora"
                      style={inputStyle()}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
                      Acompañante pedagógico
                    </label>
                    <input
                      value={datosVisita.observador}
                      onChange={(e) => actualizarDatosVisita("observador", e.target.value)}
                      style={inputStyle()}
                    />
                  </div>
                </div>

                <div style={{ ...cardStyle(), padding: 18, marginBottom: 20 }}>
                  <div style={{ fontSize: 14, color: "#64748b", marginBottom: 10 }}>
                    Desempeño del monitoreo actual
                  </div>
                  <div
                    style={{
                      ...badgeStyle(estadoActual.clase),
                      borderRadius: 18,
                      padding: 18,
                      textAlign: "center",
                      display: "inline-block",
                      minWidth: 180,
                    }}
                  >
                    <div style={{ fontSize: 36, fontWeight: 800 }}>{escalaActual.letra}</div>
                    <div style={{ marginTop: 6 }}>{escalaActual.texto}</div>
                  </div>
                </div>

                {RUBRICA_BASE.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 14,
                      background: "#fff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>
                          Criterio {index + 1}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>{item.criterio}</div>
                        <span
                          style={{
                            ...badgeStyle("outline"),
                            display: "inline-block",
                            borderRadius: 999,
                            padding: "5px 10px",
                            fontSize: 12,
                            fontWeight: 700,
                            marginTop: 6,
                          }}
                        >
                          {item.categoria}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <button
                          onClick={() =>
                            setCriterioAbierto(criterioAbierto === item.id ? null : item.id)
                          }
                          style={buttonStyle("outline")}
                        >
                          {criterioAbierto === item.id ? "Ocultar descripción" : "Ver descripción"}
                        </button>
                      </div>
                    </div>

                    {criterioAbierto === item.id && (
                      <div
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 14,
                          padding: 14,
                          marginBottom: 14,
                        }}
                      >
                        <div style={{ fontWeight: 700, marginBottom: 8 }}>Aspectos</div>
                        <ul style={{ marginTop: 0 }}>
                          {item.aspectos.map((aspecto) => (
                            <li key={aspecto} style={{ marginBottom: 4 }}>
                              {aspecto}
                            </li>
                          ))}
                        </ul>

                        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                          <div><strong>AD:</strong> {item.niveles.AD}</div>
                          <div><strong>A:</strong> {item.niveles.A}</div>
                          <div><strong>B:</strong> {item.niveles.B}</div>
                          <div><strong>C:</strong> {item.niveles.C}</div>
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: 10,
                      }}
                    >
                      {niveles.map((nivel: { valor: number; etiqueta: string; letra: string }) => {
                        const activo = (evaluacionActual[item.id] ?? 0) === nivel.valor;
                        return (
                          <button
                            key={nivel.valor}
                            onClick={() => actualizarPuntaje(item.id, nivel.valor)}
                            style={colorNivel(nivel.letra, activo)}
                          >
                            <div style={{ fontWeight: 700, fontSize: 18 }}>{nivel.letra}</div>
                            <div style={{ marginTop: 6, fontSize: 13, color: "inherit" }}>
                              {nivel.etiqueta}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 20, marginBottom: 20 }}>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
                    Observaciones generales
                  </label>
                  <textarea
                    value={datosVisita.observacionesGenerales}
                    onChange={(e) =>
                      actualizarDatosVisita("observacionesGenerales", e.target.value)
                    }
                    placeholder="Detalle aquí las observaciones generales del monitoreo..."
                    style={textareaStyle(120)}
                  />
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                  <button onClick={generarRetroalimentacion} style={buttonStyle("solid")}>
                    Generar retroalimentación del monitoreo
                  </button>
                  <button onClick={guardarLocal} style={buttonStyle("solid")}>
                    Guardar registros
                  </button>
                  <button onClick={reiniciarMonitoreoActual} style={buttonStyle("outline")}>
                    Reiniciar monitoreo actual
                  </button>
                  <button
                    onClick={() =>
                      descargarTexto(
                        retroalimentacionActual,
                        `Retroalimentacion_${docenteSeleccionado.nombre.replace(/\s+/g, "_")}_M${monitoreoActivo}.txt`
                      )
                    }
                    style={buttonStyle("outline")}
                  >
                    Descargar retroalimentación del monitoreo
                  </button>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
                    Retroalimentación guardada en este monitoreo
                  </label>
                  <textarea
                    value={retroalimentacionActual}
                    onChange={(e) => actualizarRetroalimentacion(e.target.value)}
                    placeholder="Aquí aparecerá la retroalimentación generada..."
                    style={textareaStyle(260)}
                  />
                </div>
              </div>
            )}

            {vistaActiva === "resumen" && (
              <div style={{ ...cardStyle(), padding: 20 }}>
                <h3 style={{ ...sectionTitleStyle(), fontSize: 18, marginBottom: 8 }}>
                  Resumen general
                </h3>
                <p style={{ color: "#475569", marginBottom: 16 }}>
                  El promedio general y el desempeño final se calculan con los monitoreos seleccionados.
                </p>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                        <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>Docente</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>Grado</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>M1</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>M2</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>M3</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>M4</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>M5</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                          Promedio general
                        </th>
                        <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                          Desempeño final
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumenDocentes.map((docente) => (
                        <tr key={docente.id}>
                          <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0", fontWeight: 600 }}>
                            {docente.nombre}
                          </td>
                          <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                            {docente.grado}
                          </td>
                          {docente.promediosPorMonitoreo.map((valor, index) => (
                            <td key={index} style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                              {valor.toFixed(2)}
                            </td>
                          ))}
                          <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                            {docente.promedioGeneral.toFixed(2)}
                          </td>
                          <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                            <span
                              style={{
                                ...badgeStyle(),
                                display: "inline-block",
                                borderRadius: 999,
                                padding: "6px 10px",
                                fontSize: 12,
                                fontWeight: 700,
                              }}
                            >
                              {docente.escala.letra} - {docente.escala.texto}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {vistaActiva === "grafico" && (
              <div style={{ ...cardStyle(), padding: 20 }}>
                <h3 style={{ ...sectionTitleStyle(), fontSize: 18, marginBottom: 8 }}>
                  Gráfico de desempeño
                </h3>
                <p style={{ color: "#475569", marginBottom: 16 }}>
                  Docente: <strong>{docenteSeleccionado.nombre}</strong>
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                  {MONITOREOS.map((n) => (
                    <button
                      key={n}
                      onClick={() => toggleSeleccion(n, setMonitoreosGrafico)}
                      style={buttonStyle(monitoreosGrafico.includes(n) ? "solid" : "outline")}
                    >
                      Mostrar M{n}
                    </button>
                  ))}
                </div>

                <MiniChart labels={datosGrafico.labels} values={datosGrafico.values} />
              </div>
            )}

            {vistaActiva === "historial" && (
              <div style={{ ...cardStyle(), padding: 20 }}>
                <h3 style={{ ...sectionTitleStyle(), fontSize: 18, marginBottom: 8 }}>
                  Historial por docente
                </h3>
                <p style={{ color: "#475569", marginBottom: 16 }}>
                  Docente: <strong>{docenteSeleccionado.nombre}</strong>
                </p>

                {historialDocente.map((item) => (
                  <div
                    key={item.monitoreo}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>Monitoreo {item.monitoreo}</div>
                        <div style={{ marginTop: 6, color: "#64748b" }}>
                          Fecha: {item.datosVisita.fecha || "-"} | Hora: {item.datosVisita.hora || "-"}
                        </div>
                        <div style={{ marginTop: 4, color: "#64748b" }}>
                          Área: {item.datosVisita.area || "-"} | Sesión: {item.datosVisita.sesion || "-"}
                        </div>
                      </div>

                      <div>
                        <span
                          style={{
                            ...badgeStyle(),
                            display: "inline-block",
                            borderRadius: 999,
                            padding: "8px 12px",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {item.escala.letra} - {item.escala.texto}
                        </span>
                        <div style={{ marginTop: 8, color: "#64748b" }}>
                          Promedio: {item.promedio.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <strong>Observaciones:</strong> {item.datosVisita.observacionesGenerales || "-"}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <strong>Retroalimentación:</strong>
                      <div
                        style={{
                          marginTop: 8,
                          whiteSpace: "pre-wrap",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          borderRadius: 12,
                          padding: 12,
                        }}
                      >
                        {item.retroalimentacion || "Sin retroalimentación generada."}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}