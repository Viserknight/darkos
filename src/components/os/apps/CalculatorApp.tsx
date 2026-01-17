import { useState } from "react";

const CalculatorApp = () => {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const clear = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const result = calculate(previousValue, inputValue, operator);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (prev: number, next: number, op: string): number => {
    switch (op) {
      case "+": return prev + next;
      case "-": return prev - next;
      case "×": return prev * next;
      case "÷": return next !== 0 ? prev / next : 0;
      default: return next;
    }
  };

  const handleEquals = () => {
    if (operator && previousValue !== null) {
      const result = calculate(previousValue, parseFloat(display), operator);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperator(null);
    }
  };

  const buttons = [
    ["C", "±", "%", "÷"],
    ["7", "8", "9", "×"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "+"],
    ["0", ".", "="],
  ];

  const handleClick = (btn: string) => {
    if (/\d/.test(btn)) {
      inputDigit(btn);
    } else if (btn === ".") {
      inputDecimal();
    } else if (btn === "C") {
      clear();
    } else if (btn === "=") {
      handleEquals();
    } else if (["+", "-", "×", "÷"].includes(btn)) {
      performOperation(btn);
    } else if (btn === "±") {
      setDisplay(String(-parseFloat(display)));
    } else if (btn === "%") {
      setDisplay(String(parseFloat(display) / 100));
    }
  };

  return (
    <div className="h-full bg-card/50 p-4 flex flex-col">
      {/* Display */}
      <div className="mb-4 p-4 rounded-xl bg-muted/30 text-right">
        <div className="text-muted-foreground text-xs h-4">
          {previousValue !== null && `${previousValue} ${operator || ""}`}
        </div>
        <div className="text-3xl font-light tracking-wider truncate">{display}</div>
      </div>

      {/* Buttons */}
      <div className="flex-1 grid gap-2">
        {buttons.map((row, i) => (
          <div key={i} className="flex gap-2">
            {row.map((btn) => (
              <button
                key={btn}
                onClick={() => handleClick(btn)}
                className={`flex-1 py-3 rounded-xl font-medium transition-all active:scale-95 ${
                  btn === "0" ? "col-span-2 flex-[2]" : ""
                } ${
                  ["÷", "×", "-", "+", "="].includes(btn)
                    ? "bg-primary text-primary-foreground hover:bg-primary/80"
                    : ["C", "±", "%"].includes(btn)
                    ? "bg-muted text-foreground hover:bg-muted/80"
                    : "bg-muted/30 hover:bg-muted/50"
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalculatorApp;
