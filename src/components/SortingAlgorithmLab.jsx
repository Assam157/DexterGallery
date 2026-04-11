import React, { useState, useEffect, useRef, useCallback } from "react";
import "./CommonCScss.css";

const CompilerExplorerLab = () => {
  const [activeModule, setActiveModule] = useState("ast");
  const [activeControlIndex, setActiveControlIndex] = useState(0);
  
  // AST State
  const [code, setCode] = useState(`function add(a, b) {
  return a + b;
}

let result = add(5, 3);
console.log(result);`);
  const [ast, setAst] = useState(null);
  const [tokens, setTokens] = useState([]);
  
  // Lexer State
  const [lexerInput, setLexerInput] = useState("if (x > 10) { return true; }");
  const [lexerTokens, setLexerTokens] = useState([]);
  
  const canvasRef = useRef(null);
  const lexerCanvasRef = useRef(null);
  const width = 600;
  const height = 300;
  
  const controlsRef = useRef([]);
  
  // Simple Tokenizer
  const tokenize = (input) => {
    const tokenPatterns = [
      { type: 'KEYWORD', pattern: /^(if|else|for|while|function|return|let|const|var|console|log)\b/ },
      { type: 'IDENTIFIER', pattern: /^[a-zA-Z_][a-zA-Z0-9_]*/ },
      { type: 'NUMBER', pattern: /^\d+(\.\d+)?/ },
      { type: 'STRING', pattern: /^"[^"]*"|^'[^']*'/ },
      { type: 'OPERATOR', pattern: /^[+\-*/%=<>!&|]+/ },
      { type: 'PUNCTUATION', pattern: /^[(){}\[\];,.]/ },
      { type: 'WHITESPACE', pattern: /^\s+/, skip: true }
    ];
    
    const tokens = [];
    let remaining = input;
    let line = 1, col = 1;
    
    while (remaining.length > 0) {
      let matched = false;
      for (const { type, pattern, skip } of tokenPatterns) {
        const match = remaining.match(pattern);
        if (match) {
          if (!skip) {
            tokens.push({ type, value: match[0], line, col });
          }
          remaining = remaining.slice(match[0].length);
          col += match[0].length;
          matched = true;
          break;
        }
      }
      if (!matched) {
        tokens.push({ type: 'ERROR', value: remaining[0], line, col });
        remaining = remaining.slice(1);
      }
    }
    return tokens;
  };
  
  // Simple Parser (AST Generator)
  const parseToAST = (codeStr) => {
    const tokens = tokenize(codeStr);
    // Simple AST structure for demonstration
    return {
      type: 'Program',
      body: tokens.filter(t => t.type !== 'WHITESPACE').map(t => ({
        type: 'Statement',
        token: t
      }))
    };
  };
  
  const generateAST = () => {
    const newTokens = tokenize(code);
    setTokens(newTokens);
    const newAST = parseToAST(code);
    setAst(newAST);
  };
  
  const runLexer = () => {
    const newTokens = tokenize(lexerInput);
    setLexerTokens(newTokens);
  };
  
  // Draw AST Tree
  const drawAST = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    
    if (!ast) {
      ctx.fillStyle = "#ffd966";
      ctx.font = "14px monospace";
      ctx.fillText("Click 'Parse' to generate AST", width / 2 - 150, height / 2);
      return;
    }
    
    const drawNode = (node, x, y, level) => {
      const radius = 20;
      ctx.fillStyle = "#4d9eff";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "10px monospace";
      ctx.fillText(node.type, x - 15, y + 4);
      
      if (node.token) {
        ctx.fillStyle = "#ffd966";
        ctx.font = "8px monospace";
        ctx.fillText(node.token.value, x - 10, y + 15);
      }
      
      if (node.body && node.body.length > 0) {
        const xOffset = 80 / (level + 1);
        node.body.forEach((child, i) => {
          const childX = x - xOffset + (i * xOffset * 2);
          const childY = y + 50;
          ctx.beginPath();
          ctx.moveTo(x, y + radius);
          ctx.lineTo(childX, childY - radius);
          ctx.stroke();
          drawNode(child, childX, childY, level + 1);
        });
      }
    };
    
    drawNode(ast, width / 2, 50, 0);
  }, [ast, width, height]);
  
  // Draw Lexer Tokens
  const drawLexerTokens = useCallback(() => {
    const ctx = lexerCanvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    
    if (lexerTokens.length === 0) {
      ctx.fillStyle = "#ffd966";
      ctx.font = "14px monospace";
      ctx.fillText("Click 'Tokenize' to see tokens", width / 2 - 150, height / 2);
      return;
    }
    
    const colors = {
      KEYWORD: "#ffaa66",
      IDENTIFIER: "#88ff88",
      NUMBER: "#66ffaa",
      STRING: "#ff66aa",
      OPERATOR: "#66aaff",
      PUNCTUATION: "#ffaa66",
      ERROR: "#ff6666"
    };
    
    let x = 20, y = 30;
    lexerTokens.forEach((token, i) => {
      const tokenText = `${token.type}: "${token.value}"`;
      ctx.fillStyle = colors[token.type] || "#88aadd";
      ctx.fillRect(x, y - 15, tokenText.length * 7 + 10, 25);
      ctx.fillStyle = "#000";
      ctx.font = "12px monospace";
      ctx.fillText(tokenText, x + 5, y);
      x += tokenText.length * 7 + 20;
      if (x > width - 50) {
        x = 20;
        y += 30;
      }
    });
  }, [lexerTokens, width, height]);
  
  useEffect(() => {
    if (activeModule === "ast") drawAST();
    if (activeModule === "lexer") drawLexerTokens();
  }, [drawAST, drawLexerTokens, activeModule]);
  
  // Build controls
  useEffect(() => {
    const controls = [];
    
    const codeArea = document.getElementById('codeArea');
    const parseBtn = document.getElementById('parseBtn');
    const lexerInputArea = document.getElementById('lexerInputArea');
    const tokenizeBtn = document.getElementById('tokenizeBtn');
    
    if (activeModule === "ast") {
      if (codeArea) controls.push({ id: 'codeArea', element: codeArea, type: 'textarea' });
      if (parseBtn) controls.push({ id: 'parseBtn', element: parseBtn, type: 'button' });
    } else {
      if (lexerInputArea) controls.push({ id: 'lexerInputArea', element: lexerInputArea, type: 'textarea' });
      if (tokenizeBtn) controls.push({ id: 'tokenizeBtn', element: tokenizeBtn, type: 'button' });
    }
    
    controlsRef.current = controls;
    if (activeControlIndex >= controls.length) setActiveControlIndex(0);
    
    controls.forEach((c, i) => {
      if (c.element) {
        if (i === activeControlIndex) c.element.classList.add('active-button');
        else c.element.classList.remove('active-button');
      }
    });
  }, [activeModule, activeControlIndex]);
  
  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (['q', 'e', 'a', 'd', 'h', '1', '2'].includes(key)) e.preventDefault();
      
      if (key === '1') setActiveModule('ast');
      if (key === '2') setActiveModule('lexer');
      
      if (key === 'q') setActiveControlIndex(prev => (prev - 1 + controlsRef.current.length) % Math.max(controlsRef.current.length, 1));
      if (key === 'e') setActiveControlIndex(prev => (prev + 1) % Math.max(controlsRef.current.length, 1));
      
      if (key === 'h') {
        const active = controlsRef.current[activeControlIndex];
        if (active?.element?.click) active.element.click();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeControlIndex]);
  
  return (
    <div className="cs-lab-container">
      <div className="cs-card">
        <div className="cs-header">
          <h1>📝 COMPILER EXPLORER LAB</h1>
          <div className="cs-tabs">
            <button className={`cs-tab ${activeModule === 'ast' ? 'active' : ''}`} onClick={() => setActiveModule('ast')}>🌳 AST Viewer</button>
            <button className={`cs-tab ${activeModule === 'lexer' ? 'active' : ''}`} onClick={() => setActiveModule('lexer')}>🔤 Lexical Analyzer</button>
          </div>
        </div>
        
        <div className="cs-content">
          {activeModule === "ast" && (
            <div className="cs-module">
              <canvas ref={canvasRef} width={width} height={height} className="cs-canvas" />
              <div className="cs-controls">
                <textarea id="codeArea" rows="6" value={code} onChange={(e) => setCode(e.target.value)} />
                <button id="parseBtn" onClick={generateAST}>🔍 Parse & Generate AST</button>
                <div className="token-preview">
                  <strong>Tokens ({tokens.length}):</strong> {tokens.slice(0, 15).map(t => t.value).join(", ")}
                </div>
                <div className="keyboard-hint"><kbd>Q/E</kbd> Cycle · <kbd>H</kbd> Click</div>
              </div>
            </div>
          )}
          
          {activeModule === "lexer" && (
            <div className="cs-module">
              <canvas ref={lexerCanvasRef} width={width} height={height} className="cs-canvas" />
              <div className="cs-controls">
                <textarea id="lexerInputArea" rows="4" value={lexerInput} onChange={(e) => setLexerInput(e.target.value)} />
                <button id="tokenizeBtn" onClick={runLexer}>⚙️ Tokenize</button>
                {lexerTokens.length > 0 && (
                  <div className="token-list">
                    <strong>Tokens:</strong>
                    {lexerTokens.map((t, i) => (
                      <span key={i} className={`token ${t.type}`}>{t.value}</span>
                    ))}
                  </div>
                )}
                <div className="keyboard-hint"><kbd>Q/E</kbd> Cycle · <kbd>H</kbd> Click</div>
              </div>
            </div>
          )}
        </div>
        
        <div className="cs-footer"><div className="key-hint"><kbd>1/2</kbd> Modules · <kbd>Q/E</kbd> Cycle · <kbd>H</kbd> Click</div></div>
      </div>
    </div>
  );
};

export default CompilerExplorerLab;