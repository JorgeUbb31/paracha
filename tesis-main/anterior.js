function anterior(algoritmo, p) {
    d3.select("#root").remove()
    const seq1 = $('#seq_1').val()
    const seq2 = $('#seq_2').val()
    const gap = parseInt($('#gapScore').val(), 10)
    const matchScore = parseInt($('#matchScore').val(), 10)
    const mismatchScore = parseInt($('#mismatchScore').val(), 10)

    let numNodes = Math.max(seq1.length, seq2.length) + 1;
    let nodesData = Array.from({ length: numNodes }, (_, i) => ({
        node: i === 0 ? 0 : i,
        seq1: i === 0 ? '' : seq1[i - 1] || '',
        seq2: i === 0 ? '' : seq2[i - 1] || '',
    }))

    secuencia1 = nodes.map(({ seq1 }) => seq1)
    secuencia2 = nodes.map(({ seq2 }) => seq2)
    let coordenadas = obtenerCoordenadas(paso - 1) //x,y
    let coordenadas2 = obtenerCoordenadas(paso - 2)

    let s1 = obtenerSecuencia(nodesData, coordenadas[0], "seq1")
    let s2 = obtenerSecuencia(nodesData, coordenadas[1], "seq2")
    let score = (s1 === s2) ? matchScore : mismatchScore;

    let diagonal = obtenerPuntaje(coordenadas2[0] - 1, coordenadas2[1] - 1) + score
    let superior = obtenerPuntaje(coordenadas2[0] - 1, coordenadas2[1]) + gap
    let lateral = obtenerPuntaje(coordenadas2[0], coordenadas2[1] - 1) + gap
    let zero = 0

    if (algoritmo === "nw") puntajes = [diagonal, superior, lateral]
    else if (algoritmo === "sw") puntajes = [diagonal, superior, lateral, zero]
    let maximoPuntaje = Math.max(...puntajes)

    let puntajesMaximos = []
    if (diagonal === maximoPuntaje) puntajesMaximos.push('diagonal')
    if (superior === maximoPuntaje) puntajesMaximos.push('superior')
    if (lateral === maximoPuntaje) puntajesMaximos.push('lateral')
    if (algoritmo === "sw" && maximoPuntaje === 0) puntajesMaximos.push('zero')

    edges = eliminarPuntaje(seq1, seq2, coordenadas[0], coordenadas[1]) //ELIMINAR PUNTAJE ACTUAL

    const format = d3.format(",")

    const scaleColor = d3.scaleOrdinal()
        .domain([1, 2])
        .range(["#FFCCCC", "#CCE6CC"])

    const size = 300
    const sizeCell = size / nodes.length
    const rectPadding = 0.1 * sizeCell
    const rectCell = sizeCell - rectPadding * 2

    const margin = {
        top: 50,
        bottom: 70,
        left: 70,
        right: 20
    }

    const scaleNodes = d3
        .scaleBand()
        .domain(nodes.map((d) => d.node))
        .range([0, size])

    nodes.forEach((d) => {
        const o = scaleNodes(d.node);
        d.x = o;
        d.y = o;
        d.size = scaleNodes.bandwidth();
    })

    edges.forEach((d) => {
        const { node: i, x, size } = nodes.find(({ node }) => node === d.i);
        const { node: j, y } = nodes.find(({ node }) => node === d.j);
        d.i = i
        d.j = j
        d.nodeSize = size
        d.x = y
        d.y = x
    })

    const root = d3.select("body").append("div").attr("id", "root")
    if (algoritmo === "nw") {
        root.append("h1").text("Alineamiento Global: Needleman-Wunsch");
    } else if (algoritmo === "sw") {
        root.append("h1").text("Alineamiento Local: Smith-Waterman");
    }
    root.append("p").html("LLenado de matriz paso: " + p)

    const svg = root
        .append("svg")
        .style("max-width", "rem")
        .attr(
            "viewBox",
            `0 0 ${size + margin.left + margin.right} ${size + margin.top + margin.bottom
            }`
        )

    const defs = svg.append("defs")

    const pattern = defs
        .append("pattern")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", sizeCell)
        .attr("height", sizeCell)
        .attr("id", "matrix-grid")
        .attr("viewBox", "0 0 100 100")

    pattern
        .append("rect")
        .attr("width", "100")
        .attr("height", "100")
        .attr("fill", "none")
        .attr("stroke", "hsl(205, 89%, 15%)"); //cuadriculas

    const marker = defs
        .append("marker")
        .attr("id", "marker")
        .attr("viewBox", "-0.5 -2 3 4")
        .attr("markerWidth", "5")
        .attr("markerHeight", "5")
        .attr("orient", "auto")

    marker
        .append("path")
        .attr("d", "M 0 -1.5 2 0 0 1.5z")
        .attr("fill", "hsl(0, 0%, 0%)")// nose
        .attr("stroke", "hsl(0, 0%, 0%)")//nose
        .attr("stroke-width", "1")
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")

    const group = svg
        .append("g")
        .attr("transform", `translate(${margin.left} ${margin.top})`)

    const groupNodes = group
        .append("g")
        .attr("font-size", "12")
        .attr("fill", "currentColor")
        .attr("font-weight", "700")

    const groupEdges = group.append("g")
    const groupFrame = group.append("g").style("pointer-events", "none")

    const groupHighlight = group
        .append("g")
        .style("pointer-events", "none")
        .attr("opacity", "0")

    const containerWidth = size / numNodes
    const fontSizeRatio = 0.50
    const fontSize = (size / numNodes) * 0.50

    groupNodes
        .append("g")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "end")
        .attr("transform", (d) => `translate(-10 ${d.y + d.size / 2})`)
        .style("font-size", () => `${fontSize}px`)
        .text((d) => d.seq1); //SECUENCIA 1

    groupNodes
        .append("g")
        .selectAll("text")
        .data(nodes)
        .enter()
        .append("text")
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${d.x + d.size / 2} ${-(10)})`)
        .style("font-size", () => `${fontSize}px`)
        .text((d) => d.seq2); //SECUENCIA 2

    const groupsEdges = groupEdges
        .selectAll("g")
        .data(edges)
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${d.x} ${d.y})`)

    groupsEdges //COLOR DE CELDA
        .filter((d) => d.camino)
        .append("rect")
        .attr("x", rectPadding)
        .attr("y", rectPadding)
        .attr("width", rectCell)
        .attr("height", rectCell)
        .attr("fill", (d) => scaleColor(d.camino))
        .attr("rx", "10")

    groupsEdges //PUNTAJE DE CELDA
        .filter((d) => d.puntaje !== undefined && d.puntaje !== "")
        .append("text")
        .style("font-size", () => `${fontSize}px`)
        .attr("x", rectPadding + rectCell / 2) // centro en X
        .attr("y", rectPadding + rectCell / 2) // centro en Y
        .attr("text-anchor", "middle") // centrar horizontalmente
        .attr("dominant-baseline", "middle") // centrar verticalmente
        .text((d) => d.puntaje)

    groupsEdges
        .append("rect")
        .attr("width", sizeCell)
        .attr("height", sizeCell)
        .attr("fill", "transparent")
        .attr("opacity", "0")

    groupHighlight
        .append("rect")
        .attr("width", sizeCell)
        .attr("height", sizeCell)
        .attr("fill", "hsl(205, 65%, 55%)")
        .attr("stroke", "none")
        .attr("fill-opacity", "0.1")

    groupHighlight
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "hsl(245, 99%, 68%)") //linea
        .attr("stroke-width", "2")

    groupHighlight
        .append("text")
        .attr("x", size)
        .attr("y", size + 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "hanging")
        .attr("font-size", "12")

    groupFrame //Marco de la matriz responsive
        .append("rect")
        .attr("width", (size / numNodes * m))
        .attr("height", (size / numNodes) * n)
        .attr("fill", "url(#matrix-grid)")
        .attr("stroke", "hsl(205, 89%, 15%)")
        .attr("stroke-width", "2")
        .attr("rx", "10")

    groupsEdges
        .on("mouseenter", function (e, d) {
            const value = format(d.puntaje)
            const { i, j, x, y, nodeSize: size } = d
            const diagonal = d.d
            const superior = d.s
            const lateral = d.l
            const zero = d.z
            const max = d.max
            const match = d.match
            const h = x + size / 2
            const v = y + size / 2
            const a = size / 2
            const cord = {
                h,
                v,
                a
            }

            groupHighlight
                .select("path")
                .transition()
                .attr(
                    "d",
                    `M 0 ${v} h ${h - a} a ${a} ${a} 0 0 0 ${a} ${-a} v ${-(v - a)}`
                )

            groupHighlight.select("rect").attr("transform", `translate(${x} ${y})`)

            if (i == 0 || j == 0) {
                const headerText = `<tspan x="-65" dy="1.2em">Puntaje inicicialización <tspan font-weight="700">${value}</tspan>.</tspan>`;
                groupHighlight
                    .select("text")
                    .html(headerText);
            }

            else if (!isNaN(parseInt(value.replace('−', '-'), 10))) {
                const diagonalText = `<tspan x="-65" dy="0em">Puntaje celda diagonal <tspan font-weight="700">${diagonal}</tspan> + <tspan font-weight="700">${matchScore}</tspan> (Debido a ${match} entre <tspan font-weight="700">${s1}</tspan> y <tspan font-weight="700">${s2}</tspan>).</tspan>`;
                const superiorText = `<tspan x="-65" dy="1.2em">Puntaje celda superior <tspan font-weight="700">${superior}</tspan> + <tspan font-weight="700">${gap}</tspan> (Puntaje Gap).</tspan>`;
                const lateralText = `<tspan x="-65" dy="1.2em">Puntaje celda lateral <tspan font-weight="700">${lateral}</tspan> + <tspan font-weight="700">${gap}</tspan> (Puntaje Gap).</tspan>`;
                const winerText = `<tspan x="-65" dy="1.2em">Puntaje máximo <tspan font-weight="700">${max}</tspan>`;

                groupHighlight
                    .select("text")
                    .html(diagonalText + superiorText + lateralText + winerText);
            }

            else {
                groupHighlight
                    .select("text")
                    .html(``)
            }
            groupHighlight.attr("opacity", "1")
        })
        .on("mouseleave", () => { groupHighlight.attr("opacity", "0") })

    groupEdges
        .select(`g:nth-of-type(${Math.floor(obtenerPaso(coordenadas2[0], coordenadas2[1], m) + 1)})`)
        .dispatch("mouseenter")

    let equation = createEquation(puntajesMaximos, algoritmo);
    root.append("p").html(`\\(${equation}\\)`);
    MathJax.typesetPromise();
}

function obtenerCoordenadas(paso) {
    const x = n - 1
    const y = m - 1
    if (paso < 1 || paso > x * y) {
        return null; // Paso fuera de rango, devuelve null
    }

    const fila = Math.ceil(paso / y); // Calcular la fila
    const columna = paso % y === 0 ? y : paso % y; // Calcular la columna

    return [fila, columna]; // Devolver las coordenadas como un array [fila, columna]
}

function obtenerPuntaje(i, j) {
    const diagonal = edges.find(cell => cell.i === i && cell.j === j);

    if (diagonal) {
        return diagonal.puntaje;
    } else {
        return null;
    }
}

function obtenerSecuencia(data, i, secuencia) {
    for (let elemento of data) {
        if (elemento.id === i) {
            return elemento[secuencia];
        }
    }
    return null;
}

function obtenerPaso(i, j, m) {
    return i * m + j;
}

function eliminarPuntaje(seq1, seq2, x, y) {
    const n = seq1.length
    const m = seq2.length
    const edge = edges.find(e => e.i === x && e.j === y);
    if (edge) {
        edge.puntaje = null;
        edge.diagonal = 0;
        edge.superior = 0
        edge.lateral = 0

    }
    return edges
}

function eliminarEdge(seq1, seq2, x, y) {
    const nuevoEdges = edges.filter(edge => !(edge.i === x && edge.j === y));
    return nuevoEdges;
}
