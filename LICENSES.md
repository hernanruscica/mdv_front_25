# Informe de Licencias — MDV Sensores Frontend

**Fecha:** 2026-08-31
**Alcance:** 356 dependencias analizadas (directas y transitivas) del árbol de `node_modules`.

---

## Resumen ejecutivo

**Conclusión: TODAS las dependencias usan licencias permisivas (MIT, ISC, BSD, Apache-2.0, Unlicense, Zlib, Python-2.0). No existe ninguna restricción legal para crear, vender o distribuir software de uso comercial a partir de este proyecto.**

- **No hay** ninguna licencia *copyleft* (`GPL`, `AGPL`, `LGPL`) ni propietaria/comercial que obligue a liberar el código fuente.
- Puedes explotar comercialmente el software y mantener tu código cerrado sin problemas.

---

## Dependencias directas (runtime)

| Paquete | Versión | Licencia | Uso comercial |
|---------|---------|----------|:---:|
| axios | 1.16.1 | MIT | ✅ |
| chart.js | 4.4.9 | MIT | ✅ |
| crypto-js | 4.2.0 | MIT | ✅ |
| d3 | 7.9.0 | ISC | ✅ |
| dotenv | 16.5.0 | BSD-2-Clause | ✅ |
| html2canvas | 1.4.1 | MIT | ✅ |
| jspdf | 4.2.1 | MIT | ✅ |
| jwt-decode | 4.0.0 | MIT | ✅ |
| react | 19.1.0 | MIT | ✅ |
| react-apexcharts | 1.7.0 | MIT | ✅ |
| react-dom | 19.1.0 | MIT | ✅ |
| react-hot-toast | 2.5.2 | MIT | ✅ |
| react-markdown | 10.1.0 | MIT | ✅ |
| react-modal | 3.16.3 | MIT | ✅ |
| react-router-dom | 7.16.0 | MIT | ✅ |
| recharts | 3.6.0 | MIT | ✅ |
| remark-gfm | 4.0.1 | MIT | ✅ |
| zustand | 5.0.3 | MIT | ✅ |

## Dependencias indirectas principales

| Paquete | Versión | Licencia | Uso comercial |
|---------|---------|----------|:---:|
| apexcharts | 4.7.0 | MIT | ✅ |
| @reduxjs/toolkit | 2.11.2 | MIT | ✅ |
| react-redux | 9.2.0 | MIT | ✅ |
| canvg | 3.0.11 | MIT | ✅ |
| core-js | 3.49.0 | MIT | ✅ |
| fflate | 0.8.2 | MIT | ✅ |
| nanoid | 3.3.12 | MIT | ✅ |
| postcss | 8.5.15 | MIT | ✅ |
| react-router | 7.16.0 | MIT | ✅ |
| redux | 5.0.1 | MIT | ✅ |
| redux-thunk | 3.1.0 | MIT | ✅ |
| reselect | 5.1.1 | MIT | ✅ |
| scheduler | 0.26.0 | MIT | ✅ |
| robust-predictes (d3) | - | Unlicense | ✅ |
| stackblur-canvas | 2.7.0 | MIT | ✅ |
| use-sync-external-store | 1.6.0 | MIT | ✅ |
| victory-vendor | 37.3.6 | MIT AND ISC | ✅ |

## DevDependencies (solo desarrollo, no se distribuyen)

Todas permisivas — no forman parte del producto entregado:

| Paquete | Versión | Licencia |
|---------|---------|----------|
| @eslint/js | 9.35.0 | MIT |
| @types/react | 19.1.2 | MIT |
| @types/react-dom | 19.1.2 | MIT |
| @vitejs/plugin-react-swc | 3.9.0 | MIT |
| eslint | 9.35.0 | MIT |
| eslint-plugin-react-hooks | 5.2.0 | MIT |
| eslint-plugin-react-refresh | 0.4.19 | MIT |
| globals | 16.0.0 | MIT |
| vite | 6.4.3 | MIT |

---

## Casos que requieren atención (revisados a fondo)

### 1. `apexcharts` v4.7.0 — MIT ✅
Históricamente ApexCharts tuvo una **licencia comercial restrictiva para productos SaaS/cloud**. Si lo usabas en la nube debías comprar una licencia comercial. Sin embargo, **la versión instalada (4.7.0) está publicada bajo MIT puro**, verificada directamente en su archivo `LICENSE`, lo que la hace totalmente libre para uso comercial y SaaS.

> **Recomendación:** Mantén `apexcharts` en la rama `>= 4.x` (donde ya es MIT). No regreses a versiones de la serie 3.x que tenían la cláusula restrictiva.

### 2. `dompurify` — MPL-2.0 OR Apache-2.0 ✅
Es una licencia **doble**: puedes elegir bajo cuál te acoges.
- Elegir **Apache-2.0** la vuelve totalmente permisiva para uso comercial.
- La opción **MPL-2.0** es también compatible con software comercial (su copyleft es *de archivo*, no afecta a toda tu aplicación).

Compilada por: `react-markdown` / pila de markdown y saneado de HTML.

### 3. `rgbcolor` — "Feel free" (licencia informal) ✅
Es una utilidad diminuta (usada por `canvg`/`jspdf`) cuya licencia declarada es `MIT OR SEE LICENSE IN FEEL-FREE.md`. El archivo FEEL-FREE.md establece textualmente:

> "Feel free to use the code for your own color picker tool or whatever you feel like."

Aunque no es una licencia estándar formal, la intención explícita del autor es el **uso libre**. No impone restricción comercial.

### 4. Otros paquetes con licencias múltiples permisivas

| Paquete | Licencia | Comentario |
|---------|----------|------------|
| pako | MIT AND Zlib | Ambas permisivas |
| argparse | Python-2.0 | Permisiva |
| victory-vendor | MIT AND ISC | Permisivas |
| @swc/core-linux-* | Apache-2.0 AND MIT | Permisivas |

---

## Licencias encontradas en todo el árbol (resumen estadístico)

| Licencia | Tipo | Comercial OK |
|----------|------|:---:|
| MIT | Permisiva | ✅ |
| ISC | Permisiva (equivalente a MIT) | ✅ |
| BSD-2-Clause / BSD-3-Clause | Permisiva | ✅ |
| Apache-2.0 | Permisiva | ✅ |
| Unlicense | Dominio público | ✅ |
| Zlib | Permisiva | ✅ |
| Python-2.0 | Permisiva | ✅ |
| MPL-2.0 OR Apache-2.0 | Permisiva (dual) | ✅ |
| MIT AND ISC | Permisiva | ✅ |
| MIT AND Zlib | Permisiva | ✅ |

**Licencias copyleft (GPL/AGPL/LGPL):** ninguna presente. ✅

---

## Implicaciones para tu negocio

- **MIT / ISC / BSD / Apache-2.0 / Unlicense / Zlib** te otorgan los derechos de usar, modificar, copiar y **vender** el software, incluso en productos comerciales cerrados, **sin obligación de publicar tu código fuente**.
- La **única obligación** de estas licencias es **conservar el aviso de copyright/licencia original** en las copias que distribuyas.

## Recomendaciones

1. **Conserva los avisos de copyright** de las librerías usadas al distribuir el producto (cumplimiento estándar de MIT).
2. **Bloquea `apexcharts >= 4.x`** en `package.json` para no caer en versiones con licencia comercial.
3. **Verificación automática recurrente:** añadir `license-checker` o `license-checker-rseidelsohn` como script/CI para auditar licencias en cada release.

---

*Informe generado automáticamente a partir del análisis del árbol de dependencias de `node_modules`.*
