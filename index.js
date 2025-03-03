document.addEventListener("DOMContentLoaded", function () {                     //El programa se asegura que la página esté completamente cargada antes de hacer nada
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
            entradaMinusculas = entrada.toLowerCase();
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
        //se hace una variable con las literales que se pueden utilizar
        const letras = /[pqrstz]/g;
        const literales = new Set();

        //Busca las literales individuales
        expresiones.forEach(expr => {
            (expr.match(letras) || []).forEach(v => literales.add(v));
        });
        return [...literales].sort();
    }

    function generateTruthTable(variables, expresiones) {
        //Se calcula el número de filas con la fórmula 2^n donde n es el número de literales
        const numFilas = Math.pow(2, variables.length);
        //Se inicializa el arreglo de la tabla
        const tabla = [];

        // Se generan todas las combinaciones posibles de valores de verdad
        for (let i = 0; i < numFilas; i++) {
            const fila = {};

            // Se asignan valores de verdad a cada variable
            variables.forEach((variable, index) => {
                // Se obtiene el valor de la variable en esta combinación
                // Se usa desplazamiento de bits (i >> (variables.length - index - 1)) & 1
                // para extraer los bits correspondientes a cada variable
                fila[variable] = Boolean((i >> (variables.length - index - 1)) & 1);
            });

            // Se evalúan las expresiones lógicas con los valores de la fila actual
            expresiones.forEach(expression => {
                fila[expression] = evaluateExpression(expression, fila);
            });
            // Se añade la fila completa a la tabla de verdad
            tabla.push(fila);
        }
        // Se retorna la tabla completa con todas las combinaciones de valores
        return tabla;
    }

    function evaluateExpression(expresion, values) {
        let expr = expresion.toLowerCase()
            .replace(/¬/g, "!")  // Negación
            .replace(/~/g, "!")  // Alternativa de negación
            .replace(/v/g, "||") // Disyunción
            .replace(/↔/g, "==="); // Bicondicional p ↔ q
    
        // Asegurar que todas las conjunciones estén dentro de paréntesis
        expr = expr.replace(/(\w+(\s*[∧^]\s*\w+)+)/g, "($1)").replace(/\^/g, "&&");

        // Reemplazar la implicación
        expr = expr.replace(/(\(.+?\)|\w+)\s*→\s*(\(.+?\)|\w+)/g, "!($1) || ($2)");
    
        console.log("Expresión final procesada:", expr);
    
        // Sustituir las variables con sus valores en la tabla de verdad
        for (const [variable, value] of Object.entries(values)) {
            const regex = new RegExp(`\\b${variable}\\b`, "g");
            expr = expr.replace(regex, value);
        }
    
        return Boolean(new Function(`return ${expr};`)());
    }
    


    function extractSubexpresiones(expression) {
        let subExpresiones = new Set();
        let stack = [];

        // Extraer subexpresiones contenidas en paréntesis
        for (let i = 0; i < expression.length; i++) {
            if (expression[i] === "(") {
                stack.push(i);
            } else if (expression[i] === ")") {
                if (stack.length > 0) {
                    let start = stack.pop();
                    let subexpr = expression.substring(start, i + 1);
                    subExpresiones.add(subexpr);
                }
            }
        }

        // Obtener las negaciones individuales 
        let negationRegex = /[¬~][pqrstz]/g;
        let match;
        while ((match = negationRegex.exec(expression)) !== null) {
            subExpresiones.add(match[0]);
        }

        // Agregar la expresión completa y las literales individuales
        subExpresiones.add(expression);

        // Convierte el set en un arreglo
        return [...subExpresiones];
    }

    function displayTruthTable(tabla, variables, expresiones) {

        //Se inicializa a tabla de html con clases de bootstrap para derle estilo
        let html = "<table class='table table-bordered table-dark'><thead><tr>";

        variables.forEach(variable => {
            html += `<th>${variable}</th>`; //Crea un encabzado para cada variable o literal
        });

        // Agrega los encabezados de la tabla para las expresiones lógicas evaluadas.
        expresiones.forEach(expression => {
            html += `<th>${expression}</th>`;
        });

        // Cierra la fila de encabezados y abre el cuerpo de la tabla.
        html += "</tr></thead><tbody>";

        //Se recorre cada fila de la tabla
        tabla.forEach(row => {
            html += "<tr>";
            variables.forEach(variable => {
                //Se utiliza un operador ternario para escribir V o F dependiendo el valor
                //de true o false
                html += `<td>${row[variable] ? "V" : "F"}</td>`;
            });

            expresiones.forEach(expression => {
                //Se utiliza un operador ternario para escribir V o F dependiendo el valor
                //de true o false
                html += `<td>${row[expression] ? "V" : "F"}</td>`;
            });

            html += "</tr>";
        });

        html += "</tbody></table>";
        //Se inserta el resultado de la tabla en html en el contenedor
        //del mismo nombre del DOM
        contenedorTablaVerdad.innerHTML = html;
    }
});
