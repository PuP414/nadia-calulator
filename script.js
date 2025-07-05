document.addEventListener('DOMContentLoaded', () => {
    const calculatorScreen = document.getElementById('calculatorScreen');
    const calculatorKeys = document.querySelector('.calculator-keys');

    let currentInput = '';
    let operator = null;
    let previousValue = '';
    let waitingForSecondOperand = false;

    // Function to evaluate the expression safely
    function evaluateExpression(expression) {
        try {
            // Replace x^2 and x^3 with Math.pow for evaluation
            expression = expression.replace(/(\d+(\.\d+)?)\^2/g, 'Math.pow($1, 2)');
            expression = expression.replace(/(\d+(\.\d+)?)\^3/g, 'Math.pow($1, 3)');
            // Replace sqrt with Math.sqrt
            expression = expression.replace(/sqrt\((\d+(\.\d+)?)\)/g, 'Math.sqrt($1)');

            // Basic validation for common issues (e.g., consecutive operators)
            if (/[+\-*/.]{2,}/.test(expression)) {
                return 'Error';
            }

            // Use Function constructor for safe evaluation
            const result = new Function('return ' + expression)();
            return String(result);
        } catch (error) {
            return 'Error';
        }
    }

    calculatorKeys.addEventListener('click', (event) => {
        const { target } = event;
        const { value } = target;

        if (!target.matches('button')) {
            return;
        }

        if (target.classList.contains('operator')) {
            handleOperator(value);
            return;
        }

        if (target.classList.contains('decimal')) {
            inputDecimal(value);
            return;
        }

        if (target.classList.contains('all-clear')) {
            resetCalculator();
            return;
        }

        inputDigit(value);
    });

    function inputDigit(digit) {
        if (waitingForSecondOperand === true) {
            currentInput = digit;
            waitingForSecondOperand = false;
        } else {
            currentInput = currentInput === '0' ? digit : currentInput + digit;
        }
        updateScreen();
    }

    function inputDecimal(dot) {
        if (waitingForSecondOperand === true) {
            currentInput = '0.';
            waitingForSecondOperand = false;
            updateScreen();
            return;
        }

        if (!currentInput.includes(dot)) {
            currentInput += dot;
        }
        updateScreen();
    }

    function handleOperator(nextOperator) {
        if (nextOperator === 'AC') {
            resetCalculator();
            return;
        }

        if (nextOperator === '(' || nextOperator === ')') {
            currentInput += nextOperator;
            updateScreen();
            return;
        }

        if (nextOperator === 'x^2') {
            if (currentInput !== '') {
                // To handle x^2 in the middle of an expression, we need a more robust parser
                // For simplicity, this will apply to the current number or the result
                currentInput = `(${currentInput})^2`;
                updateScreen();
            }
            return;
        }

        if (nextOperator === 'x^3') {
            if (currentInput !== '') {
                currentInput = `(${currentInput})^3`;
                updateScreen();
            }
            return;
        }

        if (nextOperator === 'sqrt') {
            if (currentInput !== '') {
                currentInput = `sqrt(${currentInput})`;
                updateScreen();
            }
            return;
        }
        
        if (nextOperator === '=') {
            if (currentInput === '') {
                return;
            }
            const result = evaluateExpression(currentInput);
            calculatorScreen.value = result;
            currentInput = result === 'Error' ? '' : result; // Clear if error
            waitingForSecondOperand = true;
            return;
        }
        
        // For standard operators (+, -, *, /)
        if (currentInput === '' && nextOperator !== '-') { // Allow leading minus sign
            return;
        }

        // Prevent adding operator immediately after another operator (unless it's a negative sign)
        if (currentInput.slice(-1).match(/[+\-*/]/) && !['+', '-', '*', '/'].includes(nextOperator)) {
            currentInput += nextOperator;
        } else if (!currentInput.slice(-1).match(/[+\-*/]/) || nextOperator === '-') {
            currentInput += nextOperator;
        }
        
        waitingForSecondOperand = false;
        updateScreen();
    }

    function updateScreen() {
        calculatorScreen.value = currentInput;
    }

    function resetCalculator() {
        currentInput = '';
        operator = null;
        previousValue = '';
        waitingForSecondOperand = false;
        calculatorScreen.value = '';
    }
});