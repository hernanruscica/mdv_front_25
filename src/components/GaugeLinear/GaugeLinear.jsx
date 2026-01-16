import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

const GaugeLinear = ({ currentValue, alarmMin = 0, alarmMax = 100 }) => {
  const gaugeRef = useRef();
  // ID único para evitar conflictos de máscaras si hay varios gauges
  const uniqueId = useMemo(() => `gauge-clip-${Math.random().toString(36).substr(2, 9)}`, []);

  useEffect(() => {
    // 1. LIMPIEZA Y VALIDACIÓN DE DATOS
    d3.select(gaugeRef.current).selectAll("*").remove();

    // Convertimos a número. Si es null, undefined o NaN, usamos 0.
    const safeValue = Number(currentValue);
    const val = isNaN(safeValue) ? 0 : safeValue;

    // 2. DIMENSIONES
    const width = 320; 
    const height = 50; // Aún más compacto
    const margin = { left: 15, right: 15, top: 20, bottom: 20 };
    const barHeight = 20; 

    const svg = d3
      .select(gaugeRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // 3. ESCALA (0 a 100)
    const x = d3.scaleLinear()
      .domain([0, 100])
      .range([margin.left, width - margin.right])
      .clamp(true); // Evita que la aguja se salga si viene un 120% o -10%

    const barY = (height / 2) - (barHeight / 2);

    // 4. DEFINICIÓN DE ZONAS (Lógica Semáforo)
    // - Zona Roja Izquierda: Desde 0 hasta el límite mínimo (alarmMin)
    // - Zona Verde: Desde alarmMin hasta alarmMax
    // - Zona Roja Derecha: Desde alarmMax hasta 100
    
    // 5. MÁSCARA (CLIP PATH) - Para bordes redondeados perfectos
    /*
    const defs = svg.append("defs");
    defs.append("clipPath")
      .attr("id", uniqueId)
      .append("rect")
      .attr("x", margin.left)
      .attr("y", barY)
      .attr("width", width - margin.left - margin.right)
      .attr("height", barHeight)
      .attr("rx", barHeight / 2); // Redondeo completo
*/
    const barGroup = svg.append("g")
      .attr("clip-path", `url(#${uniqueId})`);

    // --- CAPAS DE COLOR ---
    
    // A. Fondo Base (Gris) - Cubre todo, por si las alarmas dejan huecos
    barGroup.append("rect")
      .attr("x", margin.left)
      .attr("y", barY)
      .attr("width", width - margin.left - margin.right)
      .attr("height", barHeight)
      .attr("fill", "#e0e0e0");

    // B. Zona Roja BAJA (0 -> alarmMin)
    // Se dibuja si alarmMin > 0. Cumple tu regla: "si lectura < 5, esa zona es roja"
    if (alarmMin > 0) {
      barGroup.append("rect")
        .attr("x", x(0))
        .attr("y", barY)
        .attr("width", x(alarmMin) - x(0))
        .attr("height", barHeight)
        .attr("fill", "#FF5252"); 
    }

    // C. Zona VERDE (alarmMin -> alarmMax)
    // Esta es la zona segura.
    if (alarmMax > alarmMin) {
       barGroup.append("rect")
        .attr("x", x(alarmMin))
        .attr("y", barY)
        .attr("width", x(alarmMax) - x(alarmMin))
        .attr("height", barHeight)
        .attr("fill", "#66BB6A");
    }

    // D. Zona Roja ALTA (alarmMax -> 100)
    if (alarmMax < 100) {
      barGroup.append("rect")
        .attr("x", x(alarmMax))
        .attr("y", barY)
        .attr("width", x(100) - x(alarmMax))
        .attr("height", barHeight)
        .attr("fill", "#FF5252");
    }

    // 6. INDICADOR (AGUJA)
    // Dibujamos la aguja FUERA del clip-path para que se vea nítida
    svg.append("line")
      .attr("x1", x(val))
      .attr("x2", x(val))
      .attr("y1", barY - 0)          // Un poco más arriba de la barra
      .attr("y2", barY + barHeight + 0) // Un poco más abajo
      .attr("stroke", "#333")
      .attr("stroke-width", 3);

    // 7. TEXTO VALOR ACTUAL
    // Lógica para que no se corte en los extremos
    let textAnchor = "middle";
    if (val < 10) textAnchor = "start";
    if (val > 90) textAnchor = "end";

    // Posición X ajustada ligeramente si está en los bordes extremos
    let textX = x(val);
    if (val < 5) textX += 2; 
    if (val > 95) textX -= 2;

    svg.append("text")
      .attr("x", textX)
      .attr("y", barY - 6) 
      .attr("text-anchor", textAnchor)
      .attr("font-size", "13px")
      .attr("font-weight", "bold")
      .attr("fill", "#333")
      .text(`${val.toFixed(1)}%`); // Ahora seguro porque val es Number

    // 8. ETIQUETAS DE LIMITES (Solo si no son extremos 0 o 100)
    const labelStyle = { y: barY + barHeight + 12, size: "10px", color: "#d32f2f" };

    if (alarmMin > 2 && alarmMin < 98) {
        svg.append("text")
        .attr("x", x(alarmMin))
        .attr("y", labelStyle.y)
        .attr("text-anchor", "middle")
        .attr("font-size", labelStyle.size)
        .attr("fill", labelStyle.color)
        .text(alarmMin);
    }

    if (alarmMax < 98 && alarmMax > 2) {
        svg.append("text")
        .attr("x", x(alarmMax))
        .attr("y", labelStyle.y)
        .attr("text-anchor", "middle")
        .attr("font-size", labelStyle.size)
        .attr("fill", labelStyle.color)
        .text(alarmMax);
    }
    
  }, [currentValue, alarmMin, alarmMax, uniqueId]);

  return <div ref={gaugeRef} style={{ display: "inline-block", lineHeight: 0 }}></div>;
};

export default GaugeLinear;