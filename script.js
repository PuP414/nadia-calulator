document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('display');
    let currentInput = '';
    let result = '';
    let hasDecimal = false;

    // Function to update the display
    function updateDisplay(value) {
        display.value = value;
    }

    // Function to handle number and decimal input
    function handleNumber(num) {
        if (currentInput === 'Error') {
            currentInput = '';
        }
        if (num === '.' && hasDecimal) {
            return; // Prevent multiple decimals
        }
        if (num === '.') {
            hasDecimal = true;
            if (currentInput === '' || isOperator(currentInput.slice(-1)) || currentInput.slice(-1) === '(') {
                currentInput += '0.'; // Add leading zero for .
            } else {
                currentInput += num;
            }
        } else {
            currentInput += num;
        }
        updateDisplay(currentInput);
    }

    // Function to handle operators
    function handleOperator(op) {
        if (currentInput === 'Error') {
            currentInput = '';
        }
        if (currentInput === '' && op !== '(') return; // Don't start with an operator unless it's an open parenthesis

        const lastChar = currentInput.slice(-1);
        if (isOperator(lastChar) && lastChar !== '(' && lastChar !== ')') {
            // Replace last operator if a new one is entered (e.g., 5++ becomes 5+)
            currentInput = currentInput.slice(0, -1) + op;
        } else if (lastChar === '(' && op !== '(') {
            // Allow numbers/operators after an open parenthesis
            currentInput += op;
        } else {
            currentInput += op;
        }
        hasDecimal = false; // Reset decimal flag after an operator
        updateDisplay(currentInput);
    }

    // Function to check if a character is an operator
    function isOperator(char) {
        return ['+', '-', '*', '/', '×', '÷', '^'].includes(char);
    }

    // Function to handle special operations (power, sqrt)
    function handleSpecialOperation(action) {
        if (currentInput === 'Error') {
            currentInput = '';
        }
        if (currentInput === '') return;

        try {
            // Evaluate the current input to get the number
            let num = eval(currentInput.replace(/×/g, '*').replace(/÷/g, '/').replace(/\^/g, '**'));
            if (isNaN(num)) {
                 throw new Error("Invalid input for operation");
            }
            if (action === 'power2') {
                result = Math.pow(num, 2);
            } else if (action === 'power3') {
                result = Math.pow(num, 3);
            } else if (action === 'sqrt') {
                if (num < 0) {
                    throw new Error("Cannot take square root of a negative number");
                }
                result = Math.sqrt(num);
            }
            currentInput = result.toString();
            updateDisplay(currentInput);
            hasDecimal = currentInput.includes('.');
        } catch (error) {
            currentInput = 'Error';
            updateDisplay('Error');
            console.error("Calculation Error:", error.message);
        }
    }

    // Function to handle calculation
    function calculate() {
        if (currentInput === '') return;
        if (currentInput === 'Error') {
            currentInput = '';
            return;
        }

        try {
            // Replace custom operators with standard JS operators
            let expression = currentInput.replace(/×/g, '*').replace(/÷/g, '/');

            // Handle power operations (x^y)
            expression = expression.replace(/(\d+(\.\d+)?)\^(\d+(\.\d+)?)/g, 'Math.pow($1, $3)');

            result = eval(expression);

            if (isNaN(result) || !isFinite(result)) {
                throw new Error("Invalid calculation or division by zero");
            }
            currentInput = result.toString();
            updateDisplay(currentInput);
            hasDecimal = currentInput.includes('.');
        } catch (error) {
            currentInput = 'Error';
            updateDisplay('Error');
            console.error("Calculation Error:", error.message);
        }
    }

    // Event listener for all buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', () => {
            const buttonText = button.textContent;
            const action = button.dataset.action;

            if (button.classList.contains('number') || button.classList.contains('decimal')) {
                handleNumber(buttonText);
            } else if (button.classList.contains('operator')) {
                if (action === 'clear') {
                    currentInput = '';
                    result = '';
                    hasDecimal = false;
                    updateDisplay('0');
                } else if (action === 'backspace') {
                    currentInput = currentInput.slice(0, -1);
                    if (currentInput === '') {
                        updateDisplay('0');
                    } else {
                        updateDisplay(currentInput);
                    }
                    hasDecimal = currentInput.includes('.'); // Re-check decimal after backspace
                } else if (action === 'power2' || action === 'power3' || action === 'sqrt') {
                    handleSpecialOperation(action);
                } else if (action === 'calculate') {
                    calculate();
                } else if (action === 'open-paren') {
                    if (currentInput !== '' && !isOperator(currentInput.slice(-1)) && currentInput.slice(-1) !== '(') {
                        // If there's a number before '(', insert '*' for implicit multiplication
                        currentInput += '*(';
                    } else {
                        currentInput += '(';
                    }
                    updateDisplay(currentInput);
                } else if (action === 'close-paren') {
                    currentInput += ')';
                    updateDisplay(currentInput);
                } else {
                    handleOperator(buttonText);
                }
            }
        });
    });

    // Initialize display
    updateDisplay('0');
});