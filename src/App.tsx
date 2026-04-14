import { useState, useEffect, type ReactNode } from 'react';
import { evaluate } from 'mathjs';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Token = {
  display: string;
  math: string;
};

type ButtonConfig = {
  label: string | ReactNode;
  math?: string;
  display?: string;
  action?: 'CLEAR' | 'DEL' | 'EVAL';
  isNum?: boolean;
  className?: string;
};

const SCI_BUTTONS: ButtonConfig[] = [
  { label: 'sin', math: 'sin(', display: 'sin(', className: 'text-bento-accent font-mono text-sm' },
  { label: 'cos', math: 'cos(', display: 'cos(', className: 'text-bento-accent font-mono text-sm' },
  { label: 'tan', math: 'tan(', display: 'tan(', className: 'text-bento-accent font-mono text-sm' },
  { label: 'log', math: 'log10(', display: 'log(', className: 'text-bento-accent font-mono text-sm' },
  { label: 'ln', math: 'log(', display: 'ln(', className: 'text-bento-accent font-mono text-sm' },
  { label: '√x', math: 'sqrt(', display: '√(', className: 'text-bento-accent font-mono text-sm' },
  { label: 'x²', math: '^2', display: '²' , className: 'text-bento-accent font-mono text-sm'},
  { label: 'xʸ', math: '^', display: '^', className: 'text-bento-accent font-mono text-sm' },
  { label: 'x!', math: '!', display: '!', className: 'text-bento-accent font-mono text-sm' },
  { label: 'π', math: 'pi', display: 'π', className: 'text-bento-accent font-mono text-sm' },
  { label: 'e', math: 'e', display: 'e', className: 'text-bento-accent font-mono text-sm' },
  { label: 'Mod', math: '%', display: 'Mod', className: 'text-bento-accent font-mono text-sm' },
  { label: '(', math: '(', display: '(', className: 'text-bento-accent font-mono text-sm' },
  { label: ')', math: ')', display: ')', className: 'text-bento-accent font-mono text-sm' },
  { label: 'Exp', math: 'E', display: 'E', className: 'text-bento-accent font-mono text-sm' },
];

const NUM_BUTTONS: ButtonConfig[] = [
  { label: 'AC', action: 'CLEAR', className: 'text-bento-green bg-bento-green/10 dark:bg-bento-green/5 hover:bg-bento-green/20 dark:hover:bg-bento-green/10' },
  { label: 'DEL', action: 'DEL', className: 'text-bento-orange bg-bento-orange/10 dark:bg-bento-orange/5 hover:bg-bento-orange/20 dark:hover:bg-bento-orange/10' },
  { label: '%', math: '%', display: '%', className: 'text-bento-orange bg-bento-orange/10 dark:bg-bento-orange/5 hover:bg-bento-orange/20 dark:hover:bg-bento-orange/10' },
  { label: '÷', math: '/', display: '÷', className: 'text-bento-orange bg-bento-orange/10 dark:bg-bento-orange/5 hover:bg-bento-orange/20 dark:hover:bg-bento-orange/10 text-xl' },
  
  { label: '7', math: '7', display: '7', isNum: true },
  { label: '8', math: '8', display: '8', isNum: true },
  { label: '9', math: '9', display: '9', isNum: true },
  { label: '×', math: '*', display: '×', className: 'text-bento-orange bg-bento-orange/10 dark:bg-bento-orange/5 hover:bg-bento-orange/20 dark:hover:bg-bento-orange/10 text-xl' },
  
  { label: '4', math: '4', display: '4', isNum: true },
  { label: '5', math: '5', display: '5', isNum: true },
  { label: '6', math: '6', display: '6', isNum: true },
  { label: '−', math: '-', display: '-', className: 'text-bento-orange bg-bento-orange/10 dark:bg-bento-orange/5 hover:bg-bento-orange/20 dark:hover:bg-bento-orange/10 text-xl' },
  
  { label: '1', math: '1', display: '1', isNum: true },
  { label: '2', math: '2', display: '2', isNum: true },
  { label: '3', math: '3', display: '3', isNum: true },
  { label: '+', math: '+', display: '+', className: 'text-bento-orange bg-bento-orange/10 dark:bg-bento-orange/5 hover:bg-bento-orange/20 dark:hover:bg-bento-orange/10 text-xl' },
  
  { label: '0', math: '0', display: '0', isNum: true },
  { label: '.', math: '.', display: '.', isNum: true },
  { label: '=', action: 'EVAL', className: 'bg-bento-accent text-white hover:bg-bento-accent/90 col-span-2' },
];

type HistoryItem = {
  expression: string;
  result: string;
};

export default function App() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [result, setResult] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleButtonClick = (btn: ButtonConfig) => {
    if (btn.action === 'CLEAR') {
      setTokens([]);
      setResult('');
      setHasError(false);
      return;
    }

    if (btn.action === 'DEL') {
      setTokens((prev) => prev.slice(0, -1));
      setHasError(false);
      return;
    }

    if (btn.action === 'EVAL') {
      if (tokens.length === 0) return;
      
      const mathExpression = tokens.map(t => t.math).join('');
      try {
        const evaluated = evaluate(mathExpression);
        let formattedResult = evaluated.toString();
        if (typeof evaluated === 'number') {
          formattedResult = parseFloat(evaluated.toFixed(10)).toString();
        }
        
        setResult(formattedResult);
        setHasError(false);
        
        const displayString = tokens.map(t => t.display).join('');
        setHistory(prev => [...prev, { expression: displayString, result: formattedResult }]);
      } catch (error) {
        setResult('Erro');
        setHasError(true);
      }
      return;
    }

    if (result && !hasError) {
      if (btn.isNum || btn.math?.includes('(') || btn.math === 'pi' || btn.math === 'e') {
        setTokens([{ display: btn.display!, math: btn.math! }]);
      } else {
        setTokens([{ display: result, math: result }, { display: btn.display!, math: btn.math! }]);
      }
      setResult('');
      return;
    }

    if (btn.math && btn.display) {
      setTokens((prev) => [...prev, { display: btn.display!, math: btn.math! }]);
      setHasError(false);
    }
  };

  const displayString = tokens.map(t => t.display).join('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 lg:p-6">
      <div className="w-full max-w-[1024px] min-h-[100dvh] lg:min-h-0 lg:h-[768px] flex flex-col">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-4 lg:mb-6 shrink-0 pt-2 lg:pt-0">
          <div className="flex items-center gap-2 lg:gap-3 font-bold tracking-tight text-lg lg:text-xl">
            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-bento-accent rounded-lg flex items-center justify-center text-white text-sm lg:text-base">Σ</div>
            <span>K-ALC PRO</span>
          </div>
          <div className="bg-bento-card border border-bento-border p-1 rounded-full flex gap-1">
            <button
              onClick={() => setIsDarkMode(true)}
              className={cn(
                "px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-[10px] lg:text-xs font-semibold transition-colors",
                isDarkMode ? "bg-bento-accent text-white" : "text-bento-text-sec hover:text-bento-text"
              )}
            >
              Escuro
            </button>
            <button
              onClick={() => setIsDarkMode(false)}
              className={cn(
                "px-3 lg:px-4 py-1 lg:py-1.5 rounded-full text-[10px] lg:text-xs font-semibold transition-colors",
                !isDarkMode ? "bg-bento-accent text-white" : "text-bento-text-sec hover:text-bento-text"
              )}
            >
              Claro
            </button>
          </div>
        </header>

        {/* Main Grid */}
        <main className="flex flex-col lg:grid lg:grid-cols-[280px_1fr_240px] lg:grid-rows-[180px_1fr] gap-4 lg:gap-5 flex-1 lg:min-h-0 pb-6 lg:pb-0">
          
          {/* Display Area */}
          <section className="order-1 lg:order-none lg:col-span-2 bg-bento-card border border-bento-border rounded-3xl p-5 lg:p-8 flex flex-col justify-end items-end relative overflow-hidden min-h-[140px] lg:min-h-0">
            <div className="absolute top-4 left-4 lg:top-6 lg:left-6 bg-bento-accent-soft text-bento-accent px-2 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs font-bold uppercase">
              Calculadora Científica
            </div>
            <div className="mt-6 lg:mt-0 font-mono text-bento-text-sec text-base lg:text-lg mb-1 lg:mb-2 truncate w-full text-right">
              {displayString}
            </div>
            <div className={cn(
              "font-mono text-4xl lg:text-6xl font-medium tracking-tighter truncate w-full text-right",
              hasError ? "text-red-500" : "text-bento-text"
            )}>
              {result || (displayString ? '' : '0')}
              <span className="w-[2px] lg:w-[3px] h-[30px] lg:h-[50px] bg-bento-accent inline-block ml-1 lg:ml-2 align-middle animate-pulse"></span>
            </div>
          </section>

          {/* Sidebar History */}
          <aside className="order-4 lg:order-none lg:row-span-2 lg:col-start-3 bg-bento-card border border-bento-border rounded-3xl p-5 lg:p-6 flex flex-col overflow-hidden h-[250px] lg:h-auto">
            <div className="text-xs lg:text-sm uppercase tracking-widest text-bento-text-muted mb-3 lg:mb-5 font-bold shrink-0">
              Histórico
            </div>
            <div className="flex-1 overflow-y-auto space-y-0 pr-2">
              {history.length === 0 ? (
                <div className="text-bento-text-muted text-xs lg:text-sm text-center mt-6 lg:mt-10">Nenhum cálculo ainda</div>
              ) : (
                history.map((item, idx) => (
                  <div key={idx} className="py-2 lg:py-3 border-b border-bento-border last:border-0">
                    <div className="font-mono text-[10px] lg:text-xs text-bento-text-sec mb-1 truncate">{item.expression}</div>
                    <div className="font-mono text-sm lg:text-base font-semibold truncate">{item.result}</div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-3 lg:mt-4 shrink-0">
              <button 
                onClick={() => setHistory([])}
                className="w-full h-10 lg:h-14 bg-black/5 dark:bg-white/5 border border-dashed border-bento-border rounded-xl lg:rounded-2xl text-xs lg:text-sm font-semibold text-bento-text-muted hover:text-bento-text hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              >
                Limpar Tudo
              </button>
            </div>
          </aside>

          {/* Scientific Functions */}
          <section className="order-2 lg:order-none bg-bento-card border border-bento-border rounded-3xl p-4 lg:p-5 grid grid-cols-5 lg:grid-cols-3 gap-2 lg:gap-3">
            {SCI_BUTTONS.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleButtonClick(btn)}
                className={cn(
                  "min-h-[44px] lg:min-h-0 bg-black/5 dark:bg-white/5 border border-bento-border rounded-xl lg:rounded-2xl flex items-center justify-center font-semibold transition-all active:scale-95 hover:bg-black/10 dark:hover:bg-white/10",
                  btn.className
                )}
              >
                {btn.label}
              </button>
            ))}
          </section>

          {/* Main Keyboard */}
          <section className="order-3 lg:order-none bg-bento-card border border-bento-border rounded-3xl p-4 lg:p-5 grid grid-cols-4 gap-2 lg:gap-3">
            {NUM_BUTTONS.map((btn, idx) => (
              <button
                key={idx}
                onClick={() => handleButtonClick(btn)}
                className={cn(
                  "min-h-[52px] lg:min-h-0 bg-black/5 dark:bg-white/5 border border-bento-border rounded-xl lg:rounded-2xl flex items-center justify-center text-sm lg:text-base font-semibold transition-all active:scale-95 hover:bg-black/10 dark:hover:bg-white/10",
                  btn.isNum && "text-lg lg:text-xl bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20",
                  btn.className
                )}
              >
                {btn.label}
              </button>
            ))}
          </section>

        </main>
      </div>
    </div>
  );
}
