document.addEventListener("DOMContentLoaded", function () { //El programa se asegura que la página esté completamente cargada antes de hacer nada
    const entradaExpresion = document.getElementById("expresionLogica"); 
    const botonGenerar = document.getElementById("generarTabla");
    const contenedorTablaVerdad = document.getElementById("tablaVerdad");

    botonGenerar.addEventListener("click", function () {
        const entrada = entradaExpresion.value.trim();
        if (entrada === "") {
            alert("Por favor, ingresa una expresión lógica.");
            return
        }

        try {
            entradaMinusculas=entrada.toLowerCase();
            const expresiones = extractSubexpresiones(entradaMinusculas);
            const variables = getVariables(expresiones);
            const tabladeVerdad = generateTruthTable(variables, expresiones);
            displayTruthTable(tabladeVerdad, variables, expresiones);
        } catch (error) {
            alert("Error en la expresión lógica. Verifica la sintaxis.");
            console.error(error);
        }
    });

    function getVariables(expresiones) {
        const letras = /[pqrstz]/g;
        const literales = new Set();
        expresiones.forEach(expr => {
            (expr.match(letras) || []).forEach(v => literales.add(v));
        });
        return [...literales].sort();
    }

    function generateTruthTable(variables, expresiones) {
        const numFilas = Math.pow(2, variables.length);
        const table = [];

        for (let i = 0; i < numFilas; i++) {
            const row = {};
            variables.forEach((variable, index) => {
                row[variable] = Boolean((i >> (variables.length - index - 1)) & 1);
            });

            expresiones.forEach(expression => {
                row[expression] = evaluateExpression(expression, row);
            });

            table.push(row);
        }

        return table;
    }

    function evaluateExpression(expression, values) {
        let expr = expression.toLowerCase()
            .replace(/¬/g, "!")  // Negación
            .replace(/~/g, "!")  // Alternativa de negación
            .replace(/∧/g, "&&") // Conjunción
            .replace(/\^/g, "&&") //Conjunción
            .replace(/v/g, "||") // Disyunción
            .replace(/(\w)\s*→\s*(\w)/g, "!$1 || $2")  // Implicación p → q es equivalente a !p ∨ q
            .replace(/↔/g, "==="); // Bicondicional p ↔ q es equivalente a (p && q) || (!p && !q)

        for (const [variable, value] of Object.entries(values)) {
            const regex = new RegExp(`\\b${variable}\\b`, "g");
            expr = expr.replace(regex, value);
        }

        return Boolean(new Function(`return ${expr};`)());
    }


    function extractSubexpresiones(expression) {
        let subexpresiones = new Set();
        let stack = [];

        // Extraer subexpresiones contenidas en paréntesis
        for (let i = 0; i < expression.length; i++) {
            if (expression[i] === "(") {
                stack.push(i);
            } else if (expression[i] === ")") {
                if (stack.length > 0) {
                    let start = stack.pop();
                    let subexpr = expression.substring(start, i + 1);
                    subexpresiones.add(subexpr);
                }
            }
        }

        // Desglosar negaciones individuales y operadores lógicos
        let negationRegex = /[¬~][pqrstz]/g;
        let match;
        while ((match = negationRegex.exec(expression)) !== null) {
            subexpresiones.add(match[0]);
        }

        // Agregar la expresión completa y las variables individuales
        subexpresiones.add(expression);

        // Ordenar expresiones correctamente
        return [...subexpresiones];
    }




    function displayTruthTable(table, variables, expresiones) {
        let html = "<table class='table table-bordered table-dark'><thead><tr>";

        variables.forEach(variable => {
            html += `<th>${variable}</th>`;
        });

        expresiones.forEach(expression => {
            html += `<th>${expression}</th>`;
        });

        html += "</tr></thead><tbody>";

        table.forEach(row => {
            html += "<tr>";
            variables.forEach(variable => {
                html += `<td>${row[variable] ? "V" : "F"}</td>`;
            });

            expresiones.forEach(expression => {
                html += `<td>${row[expression] ? "V" : "F"}</td>`;
            });

            html += "</tr>";
        });

        html += "</tbody></table>";
        contenedorTablaVerdad.innerHTML = html;
    }
});
