document.addEventListener("DOMContentLoaded", function () {
    const inputExpression = document.getElementById("logicExpression");
    const generateButton = document.getElementById("generateTable");
    const truthTableContainer = document.getElementById("truthTable");

    generateButton.addEventListener("click", function () {
        const rawInput = inputExpression.value.trim();
        if (rawInput === "") {
            alert("Por favor, ingresa una expresión lógica.");
            return;
        }

        try {
            const expressions = extractSubexpressions(rawInput);
            const variables = getVariables(expressions);
            const truthTable = generateTruthTable(variables, expressions);
            displayTruthTable(truthTable, variables, expressions);
        } catch (error) {
            alert("Error en la expresión lógica. Verifica la sintaxis.");
            console.error(error);
        }
    });

    function getVariables(expressions) {
        const regex = /[pqrstz]/g;
        const matches = new Set();
        expressions.forEach(expr => {
            (expr.match(regex) || []).forEach(v => matches.add(v));
        });
        return [...matches].sort();
    }

    function generateTruthTable(variables, expressions) {
        const numRows = Math.pow(2, variables.length);
        const table = [];

        for (let i = 0; i < numRows; i++) {
            const row = {};
            variables.forEach((variable, index) => {
                row[variable] = Boolean((i >> (variables.length - index - 1)) & 1);
            });

            expressions.forEach(expression => {
                row[expression] = evaluateExpression(expression, row);
            });

            table.push(row);
        }

        return table;
    }

    function evaluateExpression(expression, values) {
        let expr = expression
            .replace(/¬/g, "!")  // Negación
            .replace(/~/g, "!")  // Alternativa de negación
            .replace(/∧/g, "&&") // Conjunción
            .replace(/v/g, "||") // Disyunción
            .replace(/(\w)\s*→\s*(\w)/g, "!$1 || $2")  // Implicación p → q es equivalente a !p ∨ q
            .replace(/↔/g, "==="); // Bicondicional p ↔ q es equivalente a (p && q) || (!p && !q)

        for (const [variable, value] of Object.entries(values)) {
            const regex = new RegExp(`\\b${variable}\\b`, "g");
            expr = expr.replace(regex, value);
        }

        return Boolean(new Function(`return ${expr};`)());
    }
   

    function extractSubexpressions(expression) {
        let subexpressions = new Set();
        let stack = [];
        
        // Extraer subexpresiones contenidas en paréntesis
        for (let i = 0; i < expression.length; i++) {
            if (expression[i] === "(") {
                stack.push(i);
            } else if (expression[i] === ")") {
                if (stack.length > 0) {
                    let start = stack.pop();
                    let subexpr = expression.substring(start, i + 1);
                    subexpressions.add(subexpr);
                }
            }
        }
    
        // Desglosar negaciones individuales y operadores lógicos
        let negationRegex = /[¬~][pqrst]/g;
        let match;
        while ((match = negationRegex.exec(expression)) !== null) {
            subexpressions.add(match[0]);
        }
    
        // Agregar la expresión completa y las variables individuales
        subexpressions.add(expression);
    
        // Ordenar expresiones correctamente
        return [...subexpressions];
    }
    
        
    

    function displayTruthTable(table, variables, expressions) {
        let html = "<table class='table table-bordered table-dark'><thead><tr>";

        variables.forEach(variable => {
            html += `<th>${variable}</th>`;
        });

        expressions.forEach(expression => {
            html += `<th>${expression}</th>`;
        });

        html += "</tr></thead><tbody>";

        table.forEach(row => {
            html += "<tr>";
            variables.forEach(variable => {
                html += `<td>${row[variable] ? "V" : "F"}</td>`;
            });

            expressions.forEach(expression => {
                html += `<td>${row[expression] ? "V" : "F"}</td>`;
            });

            html += "</tr>";
        });

        html += "</tbody></table>";
        truthTableContainer.innerHTML = html;
    }
});
