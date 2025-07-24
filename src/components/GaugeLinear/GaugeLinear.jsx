import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const GaugeLinear = ({ currentValue, alarmMin, alarmMax }) => {
  const gaugeRef = useRef();

  useEffect(() => {
    d3.select(gaugeRef.current).selectAll("*").remove();

    // Dimensiones ajustadas
    const width = 320;
    const height = 100; // Más alto para margen vertical
    const margin = { left: 20, right: 20, top: 30, bottom: 30 };

    // SVG
    const svg = d3
      .select(gaugeRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Escala
    const minValue = 0;
    const maxValue = 100;
    const x = d3.scaleLinear().domain([minValue, maxValue]).range([margin.left, width - margin.right]);

    const barY = height / 2 - 10;

    // Fondo del gauge
    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", barY)
      .attr("width", width - margin.left - margin.right)
      .attr("height", 20)
      .attr("rx", 10)
      .attr("fill", "#eee");

    // Zona de alarma baja (sin bordes redondeados)
    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", barY)
      .attr("width", x(alarmMin) - margin.left)
      .attr("height", 20)
      .attr("fill", "#FF6666");

    // Zona segura
    svg.append("rect")
      .attr("x", x(alarmMin))
      .attr("y", barY)
      .attr("width", x(alarmMax) - x(alarmMin))
      .attr("height", 20)
      .attr("fill", "#66CC66");

    // Zona de alarma alta (sin bordes redondeados)
    svg.append("rect")
      .attr("x", x(alarmMax))
      .attr("y", barY)
      .attr("width", width - margin.right - x(alarmMax))
      .attr("height", 20)
      .attr("fill", "#FF6666");

    // Aguja/indicador
    svg.append("line")
      .attr("x1", x(currentValue))
      .attr("x2", x(currentValue))
      .attr("y1", barY)              // Inicio de la barra
      .attr("y2", barY + 20)         // Fin de la barra (20px de alto)
      .attr("stroke", "black")
      .attr("stroke-width", 4);

    // Valor actual
    svg.append("text")
      .attr("x", x(currentValue))
      .attr("y", barY - 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("fill", "#333")
      .text(`${currentValue}%`);

    // Etiquetas de min, max y alarmas
    svg.append("text")
      .attr("x", x(alarmMin))
      .attr("y", barY + 45)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#FF6666")
      .text(`${alarmMin}%`);

    svg.append("text")
      .attr("x", x(alarmMax))
      .attr("y", barY + 45)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#FF6666")
      .text(`${alarmMax}%`);

    // Elimina estas dos líneas para ocultar los textos en gris de 0% y 100%
    // svg.append("text")
    //   .attr("x", margin.left)
    //   .attr("y", barY + 45)
    //   .attr("text-anchor", "start")
    //   .attr("font-size", "12px")
    //   .attr("fill", "#999")
    //   .text("0%");

    // svg.append("text")
    //   .attr("x", width - margin.right)
    //   .attr("y", barY + 45)
    //   .attr("text-anchor", "end")
    //   .attr("font-size", "12px")
    //   .attr("fill", "#999")
    //   .text("100%");
  }, [currentValue, alarmMin, alarmMax]);

  return <div ref={gaugeRef}></div>;
};

export default GaugeLinear;