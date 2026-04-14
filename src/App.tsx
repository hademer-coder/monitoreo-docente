import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Registro de notas</h1>
      <input placeholder="Buscar estudiante" />
      <button>Guardar</button>
    </div>
  );
}
export default App;
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Search, UserCheck, ClipboardList, Save, RotateCcw, School, BarChart3, FileText, Download } from "lucide-react";

const docentesBase = [
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
];

const niveles = [
  { valor: 1, etiqueta: "En inicio" },
  { valor: 2, etiqueta: "En proceso" },
  { valor: 3, etiqueta: "Logro esperado" },
  { valor: 4, etiqueta: "Logro destacado" },
];

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

function obtenerEstado(promedio: number) {
  if (promedio >= 3.5) return { texto: "Logro destacado", clase: "bg-green-100 text-green-700" };
  if (promedio >= 2.5) return { texto: "Logro esperado", clase: "bg-blue-100 text-blue-700" };
  if (promedio >= 1.5) return { texto: "En proceso", clase: "bg-yellow-100 text-yellow-700" };
  return { texto: "En inicio", clase: "bg-red-100 text-red-700" };
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

export default function WebMonitoreoDocente() {
  const [busqueda, setBusqueda] = useState("");
  const [docentes] = useState<Docente[]>(docentesBase);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<Docente>(docentesBase[0]);
  const [evaluaciones, setEvaluaciones] = useState<Record<number, Record<string, number>>>({});
  const [datosVisita, setDatosVisita] = useState<DatosVisita>({
    fecha: "",
    hora: "",
    area: "",
    sesion: "",
    observador: "LIC. VASQUEZ CCALLA YESSICA",
    observacionesGenerales: "",
  });
  const [retroalimentacionGenerada, setRetroalimentacionGenerada] = useState("");
  const [vistaActiva, setVistaActiva] = useState<"evaluacion" | "resumen">("evaluacion");

  const docentesFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return docentes.filter(
      (d) => d.nombre.toLowerCase().includes(q) || d.grado.toLowerCase().includes(q)
    );
  }, [busqueda, docentes]);

  const claveDocente = docenteSeleccionado.id;
  const evaluacionActual = evaluaciones[claveDocente] || {};

  const promedio = useMemo(() => {
    const valores = rubricaBase
      .map((r) => evaluacionActual[r.id])
      .filter((v): v is number => typeof v === "number");

    if (!valores.length) return 0;
    return valores.reduce((a, b) => a + b, 0) / valores.length;
  }, [evaluacionActual]);

  const estado = obtenerEstado(promedio);
  const escala = obtenerEscala(promedio);

  const resumenDocentes = docentes.map((docente) => {
    const puntajesDocente = evaluaciones[docente.id] || {};
    const valores = rubricaBase
      .map((r) => puntajesDocente[r.id])
      .filter((v): v is number => typeof v === "number");
    const promedioDocente = valores.length
      ? valores.reduce((a, b) => a + b, 0) / valores.length
      : 0;
    const escalaDocente = obtenerEscala(promedioDocente);
    return {
      ...docente,
      promedio: promedioDocente,
      escala: escalaDocente,
      criteriosEvaluados: valores.length,
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
      fechaGuardado: new Date().toLocaleString(),
    };

    localStorage.setItem(`monitoreo-docente-${claveDocente}`, JSON.stringify(payload));
    alert("Evaluación guardada en este navegador.");
  };

  const descargarTexto = (contenido: string, nombre: string) => {
    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generarResumenDescarga = () => {
    let texto = "";

    resumenDocentes.forEach((d, i) => {
      texto += String(i + 1) + ". " + d.nombre + " - " + d.grado + "\n";
      texto += "Promedio: " + (d.promedio ? d.promedio.toFixed(2) : "0.00") + "\n";
      texto += "Desempeño: " + d.escala.letra + " - " + d.escala.texto + "\n\n";
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
      const puntaje = evaluacionActual[r.id] || 0;
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
    const mejorasLista = criteriosEvaluados.filter((c) => c.puntaje > 0 && c.puntaje < 3);
    const sinMarcar = criteriosEvaluados.filter((c) => c.puntaje === 0);

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
      : "- En esta visita aún no se evidencian criterios en nivel esperado o destacado; por ello, será importante continuar con el acompañamiento pedagógico para fortalecer progresivamente la práctica docente.";

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
      : "- ¿Qué estrategias podrías mantener y sistematizar para seguir consolidando tus fortalezas pedagógicas?\n- ¿Cómo podrías compartir tus buenas prácticas con otros docentes de la institución?";

    const compromisosTexto = mejorasLista.length
      ? mejorasLista
          .map(
            (m) =>
              "- Fortalecer el criterio '" +
              m.criterio +
              "' mediante acciones concretas en las próximas sesiones, asegurando evidencias verificables de mejora."
          )
          .join("\n")
      : "- Mantener y sistematizar las buenas prácticas evidenciadas en la sesión observada.\n- Compartir estrategias efectivas que puedan servir como referente para otros docentes.";

    const recomendacionesTexto =
      "- Planificar sesiones con mayor articulación entre propósito, actividades, evidencias y criterios de evaluación.\n" +
      "- Fortalecer el uso de metodologías activas que promuevan participación, reflexión y pensamiento crítico.\n" +
      "- Incorporar evaluación formativa con retroalimentación específica, oportuna y orientada a la mejora.\n" +
      "- Optimizar el uso de recursos didácticos y herramientas tecnológicas con intencionalidad pedagógica.\n" +
      "- Generar ambientes de aprendizaje basados en el respeto, la cercanía y la autorregulación del comportamiento estudiantil.";

    const detalleCriterios = criteriosEvaluados
      .map(
        (c, index) =>
          String(index + 1) +
          ". " +
          c.criterio +
          " | Categoría: " +
          c.categoria +
          " | Puntaje: " +
          String(c.puntaje) +
          " | Nivel: " +
          c.letra +
          " - " +
          c.nivel
      )
      .join("\n");

    const notaSinMarcar = sinMarcar.length
      ? "\n\nNota: Existen criterios sin puntaje asignado en esta visita. Para una retroalimentación más precisa, se recomienda completar toda la rúbrica."
      : "";

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
${observaciones}${notaSinMarcar}`;

    setRetroalimentacionGenerada(texto);

    const blob = new Blob([texto], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Retroalimentacion_Docente_" + docente.replace(/\s+/g, "_") + ".docx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANQAAAEsCAYAAADH2z7PAAClK0lEQVR4nOzdd3gU1drA8e9s0vve6aSQ3kMCCQGkhA4qYhUEVFAEUHBBxY5gAf2IonoFQfQWlA6KIkhHmgBBQEiAQEjoJdQA6f0kve+7vz/2xW7YJtndJvv5PE88yd7ZmWf2TNjM3DlnhlKKIAiCIAiCIAiCIAiCIAiCiL6YqR0AQRAEQRAEQRAEQRAEQdQ1YkAQBEEQBEEQBEEQBEEQ0QcxIAiCIAiCIAiCIAiCIAjogxgQBEEQBEEQBEEQBEEQBPRBDAiCIAiCIAiCIAiCIAgC+iAGBEEQBEEQBEEQBEEQBAF9EAOCIAiCIAiCIAiCIAiCgD6IAUEQBEEQBEEQBEEQBEE0V0op5syZQ5MmTVCpVLRv316r6wiCIAiCIAiCIAiCIIj6wW63M2PGDFQqFWq1mtWrV5v9PNXVVgwIgjTk5uYyYsQI6tSpo9VlhJ8B//znP1Gr1YSEhLB48WK+//57ra6sXzZv3syIESNo2LAhKpUKi8VCnz596NixI7/++qvWV5c//P39efjhh0lNTeXzzz+nadOm2NnZsXz5ctauXQvAmDFj0Gq1LF++XKtr7YPAwEC6dOnCL7/8otVlhJ8B/75r1qzho48+4uOPP9bqMkT0R/ztSNQPRITc3FweeeQRmjVrprWl9A64b98+0tLSaNy4MSNGjOCll16iRYsWPPDAA3z00UdaX15WQkNDCQwM5Msvv2TDhg34+fnxxRdf0K9fP4KCgvjkk0+0vry0li1bxt69ewFYvXo1LVq0YNCgQYSGhjJ58mS6devGiy++qPWVpVmiLuuXzz77DH9/f9asWXPJfS9dulSue+2Dw4cP07hxY4YOHUr16tW1uoyI3oDgMSWIaKLmzZuzceNGe/fu1foydXX//n2mTp1Kt27dOHjwIJGRkfj6+vL999/TunXrYvv+9ttvjB49ms6dO3P58mW6d++O2+2mW7dufPbZZwQHBwNw+fJlevfuzTPPPEPz5s3Zv38/L7zwAn5+fty9e5fvvvuO8ePHs2jRIsLCwgBYtWoVHTp0oEOHDgQEBHDs2DGys7M5duwYw4YN03vrdu7cyWeffYabmxtjxowhPDyc5ORkevXqxapVq0hJSQFg6dKl/PPPP0ycOBG32w3AkiVLePzxx6lTpw4DBw5k5cqV3L17l3v37jFmzBh8fHxQFKXQ/v/9738ZMWIEERERLFmyhA4dOujtO3fuHMePH6djx46EhYURHh5OQkICqampBAUF6W0fM2YMLVu2JDo6mmvXrnH27Fl8fX0BaN68OTdv3iQ8PByAL774gtatWxMcHEzz5s154oknuHXrFocOHWLlypX8/PPP+Pn5MWPGDFJTU9m+fTunT59m4MCB9O3bl4SEBL788kv8/f3x8vLi4Ycf5v333yc2NpYVK1bQtWtX7t27R1JSEg8//DAArVq1YsWKFVy5coWpU6cyfPhwZs6cSW5uLh999BEzZ87kn3/+YciQIZw4cYJPP/2U7t278+CDD7J06VIAXnzxRVQqFd9++y3z58/nueee49SpU9y7d4927drx66+/Eh8fT0hICF999RVNmjShffv2fPzxx2zatImffvqJjRs38sMPP7Bq1Sq95X777Tfi4uJ49tlnWbp0KaNHj2bAgAFMnjwZi8VCr169OHr0KNHR0SQkJNC/f38eeOABDh06xIULF3jttde4evUqW7du5dNPPwXgyJEj9OnTh6ioKPbt28fdd9/N66+/zooVKxgzZgyLFy9m3rx5+Pj4YLVaSU9PJy0tjXXr1vHZZ59haWnJ7t27efzxx5k4cSL+/v6EhITw8ssvc+3aNS5fvswXX3zBV199xYQJE0hKSuLQoUNMmDABq9XK+fPnWbZsGevWraNr164sW7aMTz/9lJUrV7JmzRr27dvH8uXLAbC2tmbr1q20adOG5ORkVq1aRa1atThw4AA///wzH3/8Me7u7oSEhPD5558TFhYGwNq1a5k5cyYuLi5kZ2fzww8/4ObmhoODAytWrKBFixY0btyYtLQ0Ll26xJQpUzhw4ABNmzblyJEjPP3002zcuJFBgwbRqFEjtm/fjlarZeDAgSxatIjIyEiuX79OWFgYkydPZv78+VhaWhISEsLnn3/Oxo0b2b59O3Xq1OHevXsAODg4MHfuXLZu3cq0adPo2LEjU6dOZe3atQwdOpSwsDDOnj3L6tWr+frrr2nevDmhoaF4eXlx8OBBjh49ytSpU3nppZeYNWsWffr0QRAEli9fTt++fYmNjeXUqVO88sorjBkz5pb7IgiCIAiCIAiCIIi+ihgQxE3FixenS5cuWlsq74gDBw5gMBg4evQo+fn5xMbG6r1fMpkM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fPDBB7z99tvMnTuXLVu2MG3aNBITEwut59577+XLL79k4sSJBAQE8MorrxQ7f+fOnfTq1YvZs2fzxRdf8O233xITE8PChQvLfA5NTU3D3d2de/fuMWjQIPz8/Hjqqae4f/++3sP5wIED6devH4cPH2bMmDHUqFGj0Pf9ySef0LhxY5YvX86UKVO4efMm27Zt4/PPP6d///66NJ07dyY2NpZJkyaRnJzM33//zfLly4mJidG5t4qvQ4cObNmyhYULFzJ58mQiIyP57rvveOWVV/j666+LHWf69Ol89tlnzJgxg19//ZUXX3yR4OBg7t69q5W1ceNG7OzsCA4Opnnz5oSGhrJ69WqmTp1KpUqV8p3r22+/TdeuXZkwYQJjxoxh6NChvPXWW1y+fJlJkyYF0L17d6ysrJg0aRIzZ85k+vTpjBo1ip9//llvf2FhIbNmzWLChAm8+uqrjB07lpMnT9KiRYtC2w0GA6NGjeLrr7/m7NmzNG3atMj5Y8aM4dixY6xYsYLXX38dLy8vli5dyrRp0zAajXh5eeHu7s7rr7+Ot7c3ISEhPP/88/zwww+EhIQwYsQIli5dyuHDh0sse2+q+vTp0wwaNIikpCRcXV1fqo+qqly5MoWFhYSGhhIcHFzo+KCqqlevjqWlJTNnziz0vA8//JAuXbpw5coVxo0bx3fffcebb77J7du3LylnGzQxIAiCIAuPPPIIBw8eZObMmXTq1IlLly7xySefEB8fT2hoKNOmTcNgMPD000/r5fH29ub333/n3XffBQos0j399NN069aNHTt2sGHDBho2bMjBgwfL3CYsLIzY2Fj279/P1q1b6dSpE6tWrSIuLo758+fne41JkyZx6NAhpk2bxtNPP824ceO4du0ajzzyyEuHPj/11FP4+PgwaNAg0tPT+f3332natClnz57l+PHjhfbdvXs3DzzwAH379iU9PZ3w8HCWLVvG8ePHS7xf69atuXDhAm3btmXx4sW0bt2aRYsWAXDlyhV69+7Nzz//zP379/niiy8oLi5mz549+Pr6MnTo0GLj3Nzc6N69OxMnTqRLly7079+fL774goiIiAuu2+fzMWLECL788ksWL17M/Pnz8fb2Zv78+fz111/Fxlu0aBHOzs789ttvDB48mHfeeYfDhw8zYMAArX2LiopYv359ofLFxMQwceJEDhw4wIAB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"
            alt="Logo Colegio Adventista Túpac Amaru"
            className="mb-3 h-28 w-auto object-contain"
          />
          <h1 className="text-xl font-bold text-slate-800 md:text-2xl">
            COLEGIO ADVENTISTA TÚPAC AMARU - SEDE JERUSALÉN
          </h1>
        </div>
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
          <Button
            onClick={() => setVistaActiva("evaluacion")}
            variant={vistaActiva === "evaluacion" ? "default" : "outline"}
            className="rounded-2xl"
          >
            <FileText className="mr-2 h-4 w-4" />
            Evaluación docente
          </Button>
          <Button
            onClick={() => setVistaActiva("resumen")}
            variant={vistaActiva === "resumen" ? "default" : "outline"}
            className="rounded-2xl"
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Desempeño de docentes
          </Button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3">
                  <School className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Sistema de Monitoreo Docente</CardTitle>
                  <p className="text-sm font-medium text-slate-500">Por ADEMER HUAHUACONDORI ARANDA</p>
                  <p className="text-xs text-slate-400">Diseñador de Aprendizajes</p>
                  
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="flex h-full flex-col justify-center gap-3 p-6">
              <span className="text-sm font-medium text-slate-600">Desempeño</span>
              <div className={`inline-block rounded-2xl px-4 py-3 text-center ${estado.clase}`}>
                <div className="text-4xl font-extrabold leading-none">{escala.letra}</div>
                <div className="mt-1 text-sm">{escala.texto}</div>
              </div>
              <div className="mt-2 text-sm text-slate-500">
                Promedio: {promedio ? promedio.toFixed(2) : "0.00"}
              </div>
              <p className="text-sm text-slate-500">
                La calificación se actualiza automáticamente según los criterios marcados.
              </p>
            </CardContent>
          </Card>
        </div>

        {vistaActiva === "evaluacion" ? (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <UserCheck className="h-5 w-5" />
                  Lista de profesores
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar docente..."
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[560px] pr-3">
                  <div className="space-y-3">
                    {docentesFiltrados.map((docente) => {
                      const activo = docenteSeleccionado.id === docente.id;
                      return (
                        <button
                          key={docente.id}
                          onClick={() => setDocenteSeleccionado(docente)}
                          className={`w-full rounded-2xl border p-4 text-left transition hover:shadow-sm ${
                            activo ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="font-semibold">{docente.nombre}</div>
                          <div className={`text-sm ${activo ? "text-slate-300" : "text-slate-400"}`}>
                            {docente.grado}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ClipboardList className="h-5 w-5" />
                    Rúbrica de evaluación docente
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    Docente seleccionado: <span className="font-semibold">{docenteSeleccionado.nombre}</span> | {docenteSeleccionado.grado}
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Fecha</label>
                      <Input
                        type="date"
                        value={datosVisita.fecha}
                        onChange={(e) => setDatosVisita({ ...datosVisita, fecha: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Hora</label>
                      <Input
                        type="time"
                        value={datosVisita.hora}
                        onChange={(e) => setDatosVisita({ ...datosVisita, hora: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Área</label>
                      <Input
                        value={datosVisita.area}
                        onChange={(e) => setDatosVisita({ ...datosVisita, area: e.target.value })}
                        placeholder="Ej. Comunicación"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Nombre de la sesión</label>
                      <Input
                        value={datosVisita.sesion}
                        onChange={(e) => setDatosVisita({ ...datosVisita, sesion: e.target.value })}
                        placeholder="Ej. Comprensión lectora"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Observador</label>
                      <Input
                        value={datosVisita.observador}
                        onChange={(e) => setDatosVisita({ ...datosVisita, observador: e.target.value })}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    {rubricaBase.map((item, index) => (
                      <Card key={item.id} className="rounded-2xl border border-slate-200 shadow-none">
                        <CardContent className="p-4">
                          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="text-sm text-slate-500">Criterio {index + 1}</div>
                                <Badge variant="outline">{item.categoria}</Badge>
                              </div>
                              <div className="text-lg font-semibold">{item.criterio}</div>
                              <p className="mt-1 text-sm text-slate-600">{item.descripcion}</p>
                            </div>
                            <Badge variant="secondary">Puntaje: {evaluacionActual[item.id] || 0}</Badge>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                            {niveles.map((nivel) => {
                              const activo = evaluacionActual[item.id] === nivel.valor;
                              return (
                                <button
                                  key={nivel.valor}
                                  onClick={() => actualizarPuntaje(item.id, nivel.valor)}
                                  className={`rounded-2xl border p-3 text-left transition ${
                                    activo
                                      ? "border-slate-900 bg-slate-900 text-white"
                                      : "border-slate-200 bg-white hover:border-slate-300"
                                  }`}
                                >
                                  <div className="text-sm font-medium">{nivel.etiqueta}</div>
                                  <div className={`mt-1 text-xs ${activo ? "text-slate-200" : "text-slate-500"}`}>
                                    Valor: {nivel.valor}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Separator />

                  <div>
                    <label className="mb-2 block text-sm font-medium">Observaciones generales</label>
                    <Textarea
                      value={datosVisita.observacionesGenerales}
                      onChange={(e) =>
                        setDatosVisita({ ...datosVisita, observacionesGenerales: e.target.value })
                      }
                      placeholder="Detalle aquí las observaciones generales del monitoreo..."
                      className="min-h-[120px]"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => descargarTexto(retroalimentacionGenerada, "Retroalimentacion.txt")}
                      variant="outline"
                      className="rounded-2xl"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar retroalimentación
                    </Button>
                    <Button
                      onClick={generarRetroalimentacion}
                      className="rounded-2xl bg-purple-600 text-white hover:bg-purple-700"
                    >
                      Generar retroalimentación
                    </Button>
                    <Button onClick={guardarLocal} className="rounded-2xl">
                      <Save className="mr-2 h-4 w-4" />
                      Guardar evaluación
                    </Button>
                    <Button onClick={reiniciarRubrica} variant="outline" className="rounded-2xl">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reiniciar
                    </Button>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Retroalimentación generada (vista previa)
                    </label>
                    <Textarea
                      value={retroalimentacionGenerada}
                      onChange={(e) => setRetroalimentacionGenerada(e.target.value)}
                      placeholder="Aquí aparecerá la retroalimentación generada..."
                      className="min-h-[260px]"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5" />
                Lista de docentes con desempeño
              </CardTitle>
              <p className="text-sm text-slate-600">
                Visualiza el nivel de desempeño alcanzado por cada docente según las evaluaciones registradas.
              </p>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-end">
                <Button onClick={generarResumenDescarga} className="rounded-2xl">
                  <Download className="mr-2 h-4 w-4" />
                  Descargar resumen
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left">
                      <th className="p-3 font-semibold">Docente</th>
                      <th className="p-3 font-semibold">Grado</th>
                      <th className="p-3 font-semibold">Criterios evaluados</th>
                      <th className="p-3 font-semibold">Promedio</th>
                      <th className="p-3 font-semibold">Desempeño</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenDocentes.map((docente) => (
                      <tr key={docente.id} className="border-b hover:bg-slate-50">
                        <td className="p-3 font-medium">{docente.nombre}</td>
                        <td className="p-3">{docente.grado}</td>
                        <td className="p-3">{docente.criteriosEvaluados}</td>
                        <td className="p-3">{docente.promedio ? docente.promedio.toFixed(2) : "0.00"}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                            {docente.escala.letra} - {docente.escala.texto}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}