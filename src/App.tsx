import { useMemo, useState } from "react";

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

type CriterioEvaluado = {
  id: string;
  criterio: string;
  descripcion: string;
  categoria: string;
  puntaje: number;
  letra: string;
  nivel: string;
};

type VistaActiva = "evaluacion" | "resumen";

type Credenciales = {
  usuario: string;
  clave: string;
};

const USUARIOS = [
  { usuario: "ademer", clave: "CATA2026" },
  { usuario: "yessica", clave: "CATA2026" },
];

const docentesBase: Docente[] = [
  { id: 1, nombre: "QUICANO CONDORI KATY PAOLA", grado: "Inicial" },
  { id: 2, nombre: "SANCA COA ALVITH NINOSKA", grado: "1.º Primaria" },
  { id: 3, nombre: "ARPASI CHAHUARES NELIDA", grado: "2.º Primaria" },
  { id: 4, nombre: "MAMANI TICONA ELVIA FRIDA", grado: "3.º Primaria" },
  { id: 5, nombre: "PULLUYQUERI ITO YESICA MARLENI", grado: "4.º Primaria" },
  { id: 6, nombre: "ALIAGA SALCEDO ELISA", grado: "5.º Primaria" },
  { id: 7, nombre: "JUAREZ LUQUE CARLOS", grado: "6.º Primaria" },
];

const rubricaBase = [
  {
    id: "planificacion_1",
    criterio: "Planifica y diseña secuencias de aprendizaje",
    descripcion: "Organiza adecuadamente los procesos pedagógicos y la secuencia didáctica.",
    categoria: "PLANIFICACIÓN",
  },
  {
    id: "planificacion_2",
    criterio: "Diseña experiencias y recursos evaluativos",
    descripcion: "Elabora actividades e instrumentos coherentes con los aprendizajes.",
    categoria: "PLANIFICACIÓN",
  },
  {
    id: "ensenanza_1",
    criterio: "Involucra activamente a los estudiantes en el proceso de aprendizaje",
    descripcion: "Promueve participación activa y aprendizaje significativo.",
    categoria: "ENSEÑANZA",
  },
  {
    id: "ensenanza_2",
    criterio: "Promueve el razonamiento, la creatividad y/o el pensamiento crítico",
    descripcion: "Desarrolla habilidades superiores en los estudiantes.",
    categoria: "ENSEÑANZA",
  },
  {
    id: "aprendizaje_1",
    criterio:
      "Evalúa el progreso de los aprendizajes para retroalimentar a los estudiantes y adecuar su enseñanza",
    descripcion: "Recoge evidencias, retroalimenta oportunamente y ajusta su práctica pedagógica.",
    categoria: "APRENDIZAJE",
  },
  {
    id: "sociedad_1",
    criterio: "Propicia un ambiente de respeto y proximidad",
    descripcion: "Fomenta un clima positivo, de confianza y buen trato en el aula.",
    categoria: "SOCIEDAD",
  },
  {
    id: "sociedad_2",
    criterio: "Regula positivamente el comportamiento de los estudiantes",
    descripcion: "Aplica normas y estrategias formativas para favorecer la convivencia.",
    categoria: "SOCIEDAD",
  },
  {
    id: "tecnologia_1",
    criterio: "Gestiona espacios y recursos didácticos",
    descripcion: "Organiza el aula, materiales y recursos de manera eficiente para el aprendizaje.",
    categoria: "TECNOLOGÍA",
  },
  {
    id: "tecnologia_2",
    criterio: "Integra tecnología en el proceso de aprendizaje",
    descripcion: "Utiliza herramientas tecnológicas con propósito pedagógico.",
    categoria: "TECNOLOGÍA",
  },
] as const;

const niveles = [
  { valor: 1, etiqueta: "En inicio" },
  { valor: 2, etiqueta: "En proceso" },
  { valor: 3, etiqueta: "Logro esperado" },
  { valor: 4, etiqueta: "Logro destacado" },
];

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

function descargarTexto(contenido: string, nombre: string) {
  const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

function cardStyle(): React.CSSProperties {
  return {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    boxShadow: "0 2px 8px rgba(15, 23, 42, 0.06)",
  };
}

function sectionTitleStyle(): React.CSSProperties {
  return {
    fontSize: 20,
    fontWeight: 700,
    margin: 0,
  };
}

function buttonStyle(kind: "solid" | "outline" = "solid"): React.CSSProperties {
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

function inputStyle(): React.CSSProperties {
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

function textareaStyle(minHeight = 120): React.CSSProperties {
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

function badgeStyle(kind: string = "default"): React.CSSProperties {
  if (kind === "success") return { background: "#dcfce7", color: "#166534" };
  if (kind === "primary") return { background: "#dbeafe", color: "#1d4ed8" };
  if (kind === "warning") return { background: "#fef3c7", color: "#92400e" };
  if (kind === "danger") return { background: "#fee2e2", color: "#991b1b" };
  if (kind === "outline") {
    return { background: "#ffffff", color: "#334155", border: "1px solid #cbd5e1" };
  }
  return { background: "#f1f5f9", color: "#334155" };
}

export default function App() {
  const [autenticado, setAutenticado] = useState(
    localStorage.getItem("auth-monitoreo") === "ok"
  );

  const [credenciales, setCredenciales] = useState<Credenciales>({
    usuario: "",
    clave: "",
  });

  const [errorLogin, setErrorLogin] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [docentes] = useState<Docente[]>(docentesBase);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<Docente>(docentesBase[0]);
  const [evaluaciones, setEvaluaciones] = useState<Record<number, Record<string, number>>>({});
  const [datosVisita, setDatosVisita] = useState<DatosVisita>({
    fecha: "",
    hora: "",
    area: "",
    sesion: "",
    observador: "LIC. VÁSQUEZ CCALLA YESSICA",
    observacionesGenerales: "",
  });
  const [retroalimentacionGenerada, setRetroalimentacionGenerada] = useState("");
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>("evaluacion");

  const usuarioActivo = localStorage.getItem("usuario-activo") || "";

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

  const claveDocente = docenteSeleccionado.id;
  const evaluacionActual = evaluaciones[claveDocente] || {};

  const promedio = useMemo(() => {
    const valores = rubricaBase.map((r) => evaluacionActual[r.id] ?? 1);
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  }, [evaluacionActual]);

  const estado = obtenerEstado(promedio);
  const escala = obtenerEscala(promedio);

  const resumenDocentes = docentes.map((docente) => {
    const puntajesDocente = evaluaciones[docente.id] || {};
    const valores = rubricaBase.map((r) => puntajesDocente[r.id] ?? 1);
    const promedioDocente = valores.reduce((a, b) => a + b, 0) / valores.length;

    return {
      ...docente,
      promedio: promedioDocente,
      escala: obtenerEscala(promedioDocente),
      criteriosEvaluados: rubricaBase.length,
    };
  });

  const actualizarPuntaje = (criterioId: string, valor: number) => {
    setEvaluaciones((prev) => ({
      ...prev,
      [claveDocente]: {
        ...prev[claveDocente],
        [criterioId]: valor,
      },
    }));
  };

  const reiniciarRubrica = () => {
    setEvaluaciones((prev) => ({
      ...prev,
      [claveDocente]: {},
    }));
    setDatosVisita((prev) => ({
      ...prev,
      observacionesGenerales: "",
    }));
    setRetroalimentacionGenerada("");
  };

  const guardarLocal = () => {
    const payload = {
      docente: docenteSeleccionado,
      visita: datosVisita,
      puntajes: evaluaciones[claveDocente] || {},
      promedio,
      escala,
      retroalimentacionGenerada,
      usuarioActivo,
      fechaGuardado: new Date().toLocaleString(),
    };

    localStorage.setItem(`monitoreo-docente-${claveDocente}`, JSON.stringify(payload));
    alert("Evaluación guardada en este navegador.");
  };

  const generarResumenDescarga = () => {
    let texto = "";
    resumenDocentes.forEach((d, i) => {
      texto += `${i + 1}. ${d.nombre} - ${d.grado}\n`;
      texto += `Promedio: ${d.promedio.toFixed(2)}\n`;
      texto += `Desempeño: ${d.escala.letra} - ${d.escala.texto}\n\n`;
    });
    descargarTexto(texto, "Resumen_Docentes.txt");
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

    const criteriosEvaluados: CriterioEvaluado[] = rubricaBase.map((r) => {
      const puntaje = evaluacionActual[r.id] ?? 1;
      const nivelData = obtenerNivelPorPuntaje(puntaje);
      return {
        id: r.id,
        criterio: r.criterio,
        descripcion: r.descripcion,
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
      escala.letra === "AD"
        ? "predominio de logros destacados"
        : escala.letra === "A"
          ? "predominio de logros esperados"
          : escala.letra === "B"
            ? "predominio de criterios en proceso"
            : "predominio de criterios en inicio";

    const sintesis =
      "El análisis de la rúbrica evidencia un desempeño general ubicado en el nivel " +
      escala.texto.toLowerCase() +
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
              items
                .map(
                  (i) =>
                    "- " +
                    i.criterio +
                    ": se observan acciones pedagógicas pertinentes que favorecen la participación, la organización del aprendizaje y el desarrollo de capacidades en los estudiantes."
                )
                .join("\n")
          )
          .join("\n\n")
      : "- En esta visita aún no se evidencian criterios en nivel esperado o destacado; será importante continuar con el acompañamiento pedagógico para fortalecer progresivamente la práctica docente.";

    const mejorasTexto = Object.keys(mejoras).length
      ? Object.entries(mejoras)
          .map(
            ([categoria, items]) =>
              "En la dimensión " +
              categoria +
              ", se recomienda fortalecer los siguientes aspectos:\n" +
              items
                .map(
                  (i) =>
                    "- " +
                    i.criterio +
                    ": requiere mayor sistematicidad en la mediación pedagógica, mejor seguimiento del aprendizaje y estrategias más intencionales para lograr avances sostenidos."
                )
                .join("\n")
          )
          .join("\n\n")
      : "- No se identifican criterios prioritarios en proceso o en inicio dentro de los aspectos evaluados en esta visita.";

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
      : "- ¿Qué estrategias podrías mantener y sistematizar para seguir consolidando tus fortalezas pedagógicas?";

    const compromisosTexto = mejorasLista.length
      ? mejorasLista
          .map(
            (m) =>
              "- Fortalecer el criterio '" +
              m.criterio +
              "' mediante acciones concretas en las próximas sesiones, asegurando evidencias verificables de mejora."
          )
          .join("\n")
      : "- Mantener y sistematizar las buenas prácticas evidenciadas en la sesión observada.";

    const recomendacionesTexto =
      "- Planificar sesiones con mayor articulación entre propósito, actividades, evidencias y criterios de evaluación.\n" +
      "- Fortalecer el uso de metodologías activas que promuevan participación, reflexión y pensamiento crítico.\n" +
      "- Incorporar evaluación formativa con retroalimentación específica, oportuna y orientada a la mejora.\n" +
      "- Optimizar el uso de recursos didácticos y herramientas tecnológicas con intencionalidad pedagógica.\n" +
      "- Generar ambientes de aprendizaje basados en el respeto, la cercanía y la autorregulación del comportamiento estudiantil.";

    const detalleCriterios = criteriosEvaluados
      .map(
        (c, index) =>
          `${index + 1}. ${c.criterio} | Categoría: ${c.categoria} | Puntaje: ${c.puntaje} | Nivel: ${c.letra} - ${c.nivel}`
      )
      .join("\n");

    const texto = `RETROALIMENTACIÓN PEDAGÓGICA

1. Datos generales
Docente: ${docente}
Área: ${area}
Grado: ${grado}
Sesión: ${sesion}
Fecha: ${fecha}
Acompañante pedagógico: ${datosVisita.observador}

2. Síntesis del desempeño
${sintesis}

3. Fortalezas pedagógicas
${fortalezasTexto}

4. Aspectos por mejorar
${mejorasTexto}

5. Retroalimentación reflexiva
${preguntasReflexivas}

6. Compromisos de mejora
${compromisosTexto}

7. Recomendaciones pedagógicas
${recomendacionesTexto}

8. Conclusión
Se reconoce el compromiso profesional del docente y su disposición para continuar fortaleciendo su práctica pedagógica.

9. Detalle de resultados por criterio
${detalleCriterios}

Observaciones generales
${observaciones}`;

    setRetroalimentacionGenerada(texto);
    descargarTexto(texto, `Retroalimentacion_Docente_${docente.replace(/\s+/g, "_")}.txt`);
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
          <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: 26 }}>
            Acceso al sistema
          </h1>

          <p style={{ marginTop: 0, color: "#64748b", marginBottom: 20 }}>
            Ingrese su usuario y contraseña para continuar.
          </p>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
              Usuario
            </label>
            <input
              type="text"
              value={credenciales.usuario}
              onChange={(e) =>
                setCredenciales({ ...credenciales, usuario: e.target.value })
              }
              placeholder="Ingrese su usuario"
              style={inputStyle()}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
              Contraseña
            </label>
            <input
              type="password"
              value={credenciales.clave}
              onChange={(e) =>
                setCredenciales({ ...credenciales, clave: e.target.value })
              }
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
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>
            Sistema de Monitoreo Docente
          </h1>
          <p style={{ margin: 0, color: "#475569", fontWeight: 600 }}>
            Colegio Adventista Túpac Amaru - Sede Jerusalén
          </p>
          <p style={{ margin: "6px 0 0", color: "#94a3b8", fontSize: 13 }}>
            Por ADEMER HUAHUACONDORI ARANDA - Diseñador de Aprendizajes
          </p>

          <div style={{ marginTop: 12 }}>
            <p style={{ margin: "0 0 10px", color: "#64748b", fontSize: 13 }}>
              Usuario activo: {usuarioActivo}
            </p>
            <button onClick={cerrarSesion} style={buttonStyle("outline")}>
              Cerrar sesión
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
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
            Desempeño de docentes
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)",
            marginBottom: 24,
          }}
        >
          <div style={{ ...cardStyle(), padding: 24 }}>
            <h2 style={sectionTitleStyle()}>Panel general</h2>
            <p style={{ marginTop: 10, color: "#64748b" }}>
              Gestión de monitoreo, evaluación y retroalimentación pedagógica.
            </p>
          </div>

          <div style={{ ...cardStyle(), padding: 24 }}>
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 10 }}>
              Desempeño actual
            </div>
            <div
              style={{
                ...badgeStyle(estado.clase),
                borderRadius: 18,
                padding: 18,
                textAlign: "center",
                display: "inline-block",
                minWidth: 180,
              }}
            >
              <div style={{ fontSize: 36, fontWeight: 800 }}>{escala.letra}</div>
              <div style={{ marginTop: 6 }}>{escala.texto}</div>
            </div>
            <div style={{ marginTop: 12, color: "#64748b" }}>
              Promedio: {promedio.toFixed(2)}
            </div>
          </div>
        </div>

        {vistaActiva === "evaluacion" ? (
          <div style={{ display: "grid", gap: 24, gridTemplateColumns: "320px minmax(0, 1fr)" }}>
            <div style={{ ...cardStyle(), padding: 20 }}>
              <h3 style={{ ...sectionTitleStyle(), fontSize: 18, marginBottom: 16 }}>
                Lista de profesores
              </h3>

              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar docente..."
                style={inputStyle()}
              />

              <div style={{ marginTop: 16, maxHeight: 560, overflowY: "auto", paddingRight: 6 }}>
                {docentesFiltrados.map((docente) => {
                  const activo = docenteSeleccionado.id === docente.id;
                  return (
                    <button
                      key={docente.id}
                      onClick={() => setDocenteSeleccionado(docente)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        borderRadius: 16,
                        padding: 14,
                        border: activo ? "1px solid #111827" : "1px solid #e2e8f0",
                        background: activo ? "#111827" : "#fff",
                        color: activo ? "#fff" : "#111827",
                        marginBottom: 10,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>{docente.nombre}</div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 13,
                          color: activo ? "#cbd5e1" : "#64748b",
                        }}
                      >
                        {docente.grado}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ ...cardStyle(), padding: 20 }}>
              <h3 style={{ ...sectionTitleStyle(), fontSize: 18, marginBottom: 8 }}>
                Rúbrica de evaluación docente
              </h3>
              <p style={{ color: "#475569", marginBottom: 20 }}>
                Docente seleccionado: <strong>{docenteSeleccionado.nombre}</strong> |{" "}
                {docenteSeleccionado.grado}
              </p>

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
                    onChange={(e) => setDatosVisita({ ...datosVisita, fecha: e.target.value })}
                    style={inputStyle()}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Hora</label>
                  <input
                    type="time"
                    value={datosVisita.hora}
                    onChange={(e) => setDatosVisita({ ...datosVisita, hora: e.target.value })}
                    style={inputStyle()}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Área</label>
                  <input
                    value={datosVisita.area}
                    onChange={(e) => setDatosVisita({ ...datosVisita, area: e.target.value })}
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
                    onChange={(e) => setDatosVisita({ ...datosVisita, sesion: e.target.value })}
                    placeholder="Ej. Comprensión lectora"
                    style={inputStyle()}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
                    Observador
                  </label>
                  <input
                    value={datosVisita.observador}
                    onChange={(e) => setDatosVisita({ ...datosVisita, observador: e.target.value })}
                    style={inputStyle()}
                  />
                </div>
              </div>

              <div style={{ height: 1, background: "#e2e8f0", margin: "20px 0" }} />

              <div>
                {rubricaBase.map((item, index) => (
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
                        <p style={{ marginTop: 6, color: "#475569" }}>{item.descripcion}</p>
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

                      <span
                        style={{
                          ...badgeStyle(),
                          display: "inline-block",
                          borderRadius: 999,
                          padding: "8px 12px",
                          fontSize: 12,
                          fontWeight: 700,
                          height: "fit-content",
                        }}
                      >
                        Puntaje: {evaluacionActual[item.id] ?? 1}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                        gap: 10,
                      }}
                    >
                      {niveles.map((nivel) => {
                        const activo = evaluacionActual[item.id] === nivel.valor;
                        return (
                          <button
                            key={nivel.valor}
                            onClick={() => actualizarPuntaje(item.id, nivel.valor)}
                            style={{
                              borderRadius: 14,
                              padding: 12,
                              textAlign: "left",
                              border: activo ? "1px solid #111827" : "1px solid #e2e8f0",
                              background: activo ? "#111827" : "#fff",
                              color: activo ? "#fff" : "#111827",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ fontWeight: 600 }}>{nivel.etiqueta}</div>
                            <div
                              style={{
                                marginTop: 6,
                                fontSize: 12,
                                color: activo ? "#cbd5e1" : "#64748b",
                              }}
                            >
                              Valor: {nivel.valor}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: "#e2e8f0", margin: "20px 0" }} />

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
                  Observaciones generales
                </label>
                <textarea
                  value={datosVisita.observacionesGenerales}
                  onChange={(e) =>
                    setDatosVisita({ ...datosVisita, observacionesGenerales: e.target.value })
                  }
                  placeholder="Detalle aquí las observaciones generales del monitoreo..."
                  style={textareaStyle(120)}
                />
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                <button
                  onClick={() => descargarTexto(retroalimentacionGenerada, "Retroalimentacion.txt")}
                  style={buttonStyle("outline")}
                >
                  Descargar retroalimentación
                </button>
                <button
                  onClick={generarRetroalimentacion}
                  style={{
                    ...buttonStyle("solid"),
                    background: "#7c3aed",
                    borderColor: "#7c3aed",
                  }}
                >
                  Generar retroalimentación
                </button>
                <button onClick={guardarLocal} style={buttonStyle("solid")}>
                  Guardar evaluación
                </button>
                <button onClick={reiniciarRubrica} style={buttonStyle("outline")}>
                  Reiniciar
                </button>
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
                  Retroalimentación generada
                </label>
                <textarea
                  value={retroalimentacionGenerada}
                  onChange={(e) => setRetroalimentacionGenerada(e.target.value)}
                  placeholder="Aquí aparecerá la retroalimentación generada..."
                  style={textareaStyle(260)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div style={{ ...cardStyle(), padding: 20 }}>
            <h3 style={{ ...sectionTitleStyle(), fontSize: 18, marginBottom: 8 }}>
              Lista de docentes con desempeño
            </h3>
            <p style={{ color: "#475569", marginBottom: 16 }}>
              Visualiza el nivel de desempeño alcanzado por cada docente según las evaluaciones registradas.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button onClick={generarResumenDescarga} style={buttonStyle("solid")}>
                Descargar resumen
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                    <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>Docente</th>
                    <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>Grado</th>
                    <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                      Criterios evaluados
                    </th>
                    <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>Promedio</th>
                    <th style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>Desempeño</th>
                  </tr>
                </thead>
                <tbody>
                  {resumenDocentes.map((docente) => (
                    <tr key={docente.id}>
                      <td
                        style={{
                          padding: 12,
                          borderBottom: "1px solid #e2e8f0",
                          fontWeight: 600,
                        }}
                      >
                        {docente.nombre}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                        {docente.grado}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                        {docente.criteriosEvaluados}
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #e2e8f0" }}>
                        {docente.promedio.toFixed(2)}
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
      </div>
    </div>
  );
}