 import React, { useMemo, useState } from "react";
import "./OrbitalExcitationExperiment.css";

/* -------------------------------------------------------------------------- */
/* Madelung (n + l) filling order — the true energy order, not n order.       */
/* -------------------------------------------------------------------------- */
const FILL_ORDER = [
  { n: 1, l: 0, label: "1s", boxes: 1 },
  { n: 2, l: 0, label: "2s", boxes: 1 },
  { n: 2, l: 1, label: "2p", boxes: 3 },
  { n: 3, l: 0, label: "3s", boxes: 1 },
  { n: 3, l: 1, label: "3p", boxes: 3 },
  { n: 4, l: 0, label: "4s", boxes: 1 },   // ← fills BEFORE 3d
  { n: 3, l: 2, label: "3d", boxes: 5 },
  { n: 4, l: 1, label: "4p", boxes: 3 },
  { n: 5, l: 0, label: "5s", boxes: 1 },
  { n: 4, l: 2, label: "4d", boxes: 5 },
  { n: 5, l: 1, label: "5p", boxes: 3 },
 // spare room for excitations
];

const ELEMENTS = [
  [1, "H", "Hydrogen"], [2, "He", "Helium"], [3, "Li", "Lithium"],
  [4, "Be", "Beryllium"], [5, "B", "Boron"], [6, "C", "Carbon"],
  [7, "N", "Nitrogen"], [8, "O", "Oxygen"], [9, "F", "Fluorine"],
  [10, "Ne", "Neon"], [11, "Na", "Sodium"], [12, "Mg", "Magnesium"],
  [13, "Al", "Aluminium"], [14, "Si", "Silicon"], [15, "P", "Phosphorus"],
  [16, "S", "Sulfur"], [17, "Cl", "Chlorine"], [18, "Ar", "Argon"],
  [19, "K", "Potassium"], [20, "Ca", "Calcium"], [21, "Sc", "Scandium"],
  [22, "Ti", "Titanium"], [23, "V", "Vanadium"], [24, "Cr", "Chromium"],
  [25, "Mn", "Manganese"], [26, "Fe", "Iron"], [27, "Co", "Cobalt"],
  [28, "Ni", "Nickel"], [29, "Cu", "Copper"], [30, "Zn", "Zinc"],
  [31, "Ga", "Gallium"], [32, "Ge", "Germanium"], [33, "As", "Arsenic"],
  [34, "Se", "Selenium"], [35, "Br", "Bromine"], [36, "Kr", "Krypton"],
  [37, "Rb", "Rubidium"], [38, "Sr", "Strontium"], [39, "Y", "Yttrium"],
  [40, "Zr", "Zirconium"], [41, "Nb", "Niobium"], [42, "Mo", "Molybdenum"],
  [43, "Tc", "Technetium"], [44, "Ru", "Ruthenium"], [45, "Rh", "Rhodium"],
  [46, "Pd", "Palladium"], [47, "Ag", "Silver"], [48, "Cd", "Cadmium"],
  [49, "In", "Indium"], [50, "Sn", "Tin"], [51, "Sb", "Antimony"],
  [52, "Te", "Tellurium"], [53, "I", "Iodine"], [54, "Xe", "Xenon"],
].map(([z, sym, name]) => ({ z, sym, name }));

/* -------------------------------------------------------------------------- */
/* Ground-state exceptions to Madelung for Z ≤ 54.                            */
/* Each entry maps subshell → electron count that OVERRIDES the base fill.    */
/* -------------------------------------------------------------------------- */
const EXCEPTIONS = {
  24: { "3d": 5,  "4s": 1 },   // Cr : [Ar] 3d⁵ 4s¹
  29: { "3d": 10, "4s": 1 },   // Cu : [Ar] 3d¹⁰ 4s¹
  41: { "4d": 4,  "5s": 1 },   // Nb : [Kr] 4d⁴ 5s¹
  42: { "4d": 5,  "5s": 1 },   // Mo : [Kr] 4d⁵ 5s¹
  44: { "4d": 7,  "5s": 1 },   // Ru : [Kr] 4d⁷ 5s¹
  45: { "4d": 8,  "5s": 1 },   // Rh : [Kr] 4d⁸ 5s¹
  46: { "4d": 10, "5s": 0 },   // Pd : [Kr] 4d¹⁰ (no 5s)
  47: { "4d": 10, "5s": 1 },   // Ag : [Kr] 4d¹⁰ 5s¹
};

/* -------------------------------------------------------------------------- */
/* Electron layout for one subshell — Hund's rule + Pauli.                    */
/* -------------------------------------------------------------------------- */
function buildElectrons(boxCount, electronCount) {
  const boxes = Array.from({ length: boxCount }, () => []);
  const singles = Math.min(electronCount, boxCount);
  for (let i = 0; i < singles; i++) boxes[i].push("up");
  const pairs = electronCount - singles;
  for (let i = 0; i < pairs; i++) boxes[i].push("down");
  return boxes;
}

function fillGroundState(Z) {
  const config = FILL_ORDER.map((s) => ({
    ...s,
    electrons: Array.from({ length: s.boxes }, () => []),
  }));

  let remaining = Z;
  for (let i = 0; i < config.length && remaining > 0; i++) {
    const sub = config[i];
    const cap = sub.boxes * 2;
    const fill = Math.min(remaining, cap);
    sub.electrons = buildElectrons(sub.boxes, fill);
    remaining -= fill;
  }

  const exc = EXCEPTIONS[Z];
  if (exc) {
    for (const [label, count] of Object.entries(exc)) {
      const sub = config.find((s) => s.label === label);
      if (sub) sub.electrons = buildElectrons(sub.boxes, count);
    }
  }
  return config;
}

/* -------------------------------------------------------------------------- */
/* Pretty configuration string, e.g. "1s² 2s² 2p²".                           */
/* -------------------------------------------------------------------------- */
const SUP = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
const sup = (n) => String(n).split("").map((d) => SUP[+d]).join("");

function configToString(config) {
  return config
    .filter((s) => s.electrons.some((b) => b.length > 0))
    .map((s) => {
      const c = s.electrons.reduce((a, b) => a + b.length, 0);
      return `${s.label}${sup(c)}`;
    })
    .join(" ");
}

/* -------------------------------------------------------------------------- */
/* Promote the outermost electron to the first empty slot above.              */
/* Mutates the config in place; returns the config or null if impossible.     */
/* -------------------------------------------------------------------------- */
function promoteElectron(config) {
  for (let i = config.length - 1; i >= 0; i--) {
    const sub = config[i];
    for (let j = sub.electrons.length - 1; j >= 0; j--) {
      if (sub.electrons[j].length === 0) continue;

      const ejected = sub.electrons[j].pop();

      for (let k = i + 1; k < config.length; k++) {
        const target = config[k];
        for (let m = 0; m < target.electrons.length; m++) {
          if (target.electrons[m].length < 2) {
            target.electrons[m].push({ spin: "up", excited: true });
            return config;
          }
        }
      }
      sub.electrons[j].push(ejected);
      return null;
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */
export default function OrbitalBoxesExperiment() {
  const [Z, setZ] = useState(6);
  const [excited, setExcited] = useState(false);

  const element = ELEMENTS.find((e) => e.z === Z) ?? ELEMENTS[0];

  const displayedConfig = useMemo(() => {
    const base = fillGroundState(Z);
    const clone = base.map((s) => ({
      ...s,
      electrons: s.electrons.map((box) =>
        box.map((spin) => ({ spin, excited: false }))
      ),
    }));
    if (excited) promoteElectron(clone);
    return clone;
  }, [Z, excited]);

  const canExcite = useMemo(() => {
    if (excited) return true;
    const test = fillGroundState(Z).map((s) => ({
      ...s,
      electrons: s.electrons.map((b) => [...b]),
    }));
    return promoteElectron(test) !== null;
  }, [Z, excited]);

  return (
    <div className="orbital-experiment">
      <header className="orbital-header">
        <h2>Orbital Filling Diagram</h2>
        <p className="orbital-subtitle">
          Aufbau · Pauli exclusion · Hund's rule
        </p>
      </header>

      <div className="orbital-element-selector">
        <input
          type="range"
          min={1}
          max={54}
          value={Z}
          onChange={(e) => {
            setZ(+e.target.value);
            setExcited(false);
          }}
          aria-label="Atomic number"
        />
        <div className="element-info">
          <span className="symbol">{element.sym}</span>
          <span className="name">{element.name}</span>
          <span className="z">Z = {element.z}</span>
        </div>
      </div>

      <div className="orbital-table">
        {displayedConfig.map((sub) => (
          <div key={sub.label} className="orbital-row">
            <div className="orbital-label">
              {sub.label}
              <span className="n-value">n = {sub.n}</span>
            </div>
            <div className="box-row">
              {sub.electrons.map((box, j) => (
                <div key={j} className="orbital-box">
                  {box.map((e, k) => (
                    <span
                      key={k}
                      className={`electron ${e.spin}${e.excited ? " excited" : ""}`}
                    >
                      {e.spin === "up" ? "↑" : "↓"}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="orbital-readout">
        <span className="label">Configuration:</span>
        <code className="value">{configToString(displayedConfig)}</code>
      </div>

      <div className="controls">
        <button
          onClick={() => setExcited((x) => !x)}
          className={excited ? "active" : ""}
          disabled={!canExcite}
        >
          {excited ? "Return to Ground State" : "Excite Atom"}
        </button>
        <button
          className="reset"
          onClick={() => {
            setExcited(false);
            setZ(6);
          }}
        >
          Reset
        </button>
      </div>

      <p className="orbital-hint">
        {excited
          ? "The amber electron has been promoted to a higher-energy subshell. In a real atom, this requires absorbing a photon of energy hν = ΔE; the atom then decays back by emitting a photon of the same energy."
          : "Subshells fill in Madelung (n + l) order — lowest n + l first. Within a subshell, Hund's rule keeps spins parallel until every box has one electron, and Pauli forbids two electrons with the same spin in one box."}
      </p>
    </div>
  );
}