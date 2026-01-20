import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface CalculatorAppProps {
  onSecretCodeEntered?: () => void;
  secretCode?: string;
  isDisguise?: boolean;
}

export function CalculatorApp({ 
  onSecretCodeEntered, 
  secretCode = '1234',
  isDisguise = false 
}: CalculatorAppProps) {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [enteredCode, setEnteredCode] = useState('');

  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
    
    // Track code entry for secret unlock
    if (isDisguise && onSecretCodeEntered) {
      const newCode = enteredCode + digit;
      setEnteredCode(newCode);
      
      if (newCode === secretCode) {
        onSecretCodeEntered();
        setEnteredCode('');
      } else if (!secretCode.startsWith(newCode)) {
        setEnteredCode(digit); // Reset if pattern breaks
      }
    }
  }, [display, waitingForOperand, isDisguise, onSecretCodeEntered, secretCode, enteredCode]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, waitingForOperand]);

  const clear = useCallback(() => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setEnteredCode('');
  }, []);

  const toggleSign = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  }, [display]);

  const inputPercent = useCallback(() => {
    const value = parseFloat(display);
    setDisplay(String(value / 100));
  }, [display]);

  const performOperation = useCallback((nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue;
      let newValue: number;

      switch (operation) {
        case '+':
          newValue = currentValue + inputValue;
          break;
        case '-':
          newValue = currentValue - inputValue;
          break;
        case '×':
          newValue = currentValue * inputValue;
          break;
        case '÷':
          newValue = inputValue !== 0 ? currentValue / inputValue : 0;
          break;
        default:
          newValue = inputValue;
      }

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  }, [display, previousValue, operation]);

  const calculate = useCallback(() => {
    if (operation === null || previousValue === null) return;

    const inputValue = parseFloat(display);
    let newValue: number;

    switch (operation) {
      case '+':
        newValue = previousValue + inputValue;
        break;
      case '-':
        newValue = previousValue - inputValue;
        break;
      case '×':
        newValue = previousValue * inputValue;
        break;
      case '÷':
        newValue = inputValue !== 0 ? previousValue / inputValue : 0;
        break;
      default:
        newValue = inputValue;
    }

    setDisplay(String(newValue));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  }, [display, previousValue, operation]);

  const buttons = [
    { label: 'C', onClick: clear, className: 'bg-muted/80 text-foreground' },
    { label: '±', onClick: toggleSign, className: 'bg-muted/80 text-foreground' },
    { label: '%', onClick: inputPercent, className: 'bg-muted/80 text-foreground' },
    { label: '÷', onClick: () => performOperation('÷'), className: 'bg-primary text-primary-foreground' },
    { label: '7', onClick: () => inputDigit('7'), className: 'bg-muted/50' },
    { label: '8', onClick: () => inputDigit('8'), className: 'bg-muted/50' },
    { label: '9', onClick: () => inputDigit('9'), className: 'bg-muted/50' },
    { label: '×', onClick: () => performOperation('×'), className: 'bg-primary text-primary-foreground' },
    { label: '4', onClick: () => inputDigit('4'), className: 'bg-muted/50' },
    { label: '5', onClick: () => inputDigit('5'), className: 'bg-muted/50' },
    { label: '6', onClick: () => inputDigit('6'), className: 'bg-muted/50' },
    { label: '-', onClick: () => performOperation('-'), className: 'bg-primary text-primary-foreground' },
    { label: '1', onClick: () => inputDigit('1'), className: 'bg-muted/50' },
    { label: '2', onClick: () => inputDigit('2'), className: 'bg-muted/50' },
    { label: '3', onClick: () => inputDigit('3'), className: 'bg-muted/50' },
    { label: '+', onClick: () => performOperation('+'), className: 'bg-primary text-primary-foreground' },
    { label: '0', onClick: () => inputDigit('0'), className: 'bg-muted/50 col-span-2' },
    { label: '.', onClick: inputDecimal, className: 'bg-muted/50' },
    { label: '=', onClick: calculate, className: 'bg-primary text-primary-foreground' },
  ];

  return (
    <div className="h-full flex flex-col p-3">
      {/* Display */}
      <div className="glass rounded-xl p-3 mb-3">
        <div className="text-right text-3xl font-mono font-bold truncate">
          {display}
        </div>
        {operation && (
          <div className="text-right text-xs text-muted-foreground">
            {previousValue} {operation}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1.5 flex-1">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            className={cn(
              "rounded-lg font-semibold text-lg transition-all active:scale-95",
              "flex items-center justify-center",
              btn.className,
              btn.label === '0' && "col-span-2"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Subtle hint for disguise mode */}
      {isDisguise && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
          <div className="flex gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-1 h-1 rounded-full transition-colors",
                  i < enteredCode.length ? "bg-primary/40" : "bg-muted/20"
                )} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
