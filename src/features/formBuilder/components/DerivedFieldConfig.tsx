import { useState, useEffect, useRef } from "react";
import { type Field } from "../types";

const OPERATORS = ["+", "-", "*", "/", "(", ")", "?", ":", "if"];

const HELPER_FUNCTIONS_INFO = [
  { name: "computeAge(parents['DOB'])", description: "Calculate age from DOB (yyyy-mm-dd)" },
  { name: "sum(parents['field1'], parents['field2'])", description: "Sum numbers" },
  { name: "concat(parents['field1'], parents['field2'])", description: "Concatenate strings" },
  { name: "avg(parents['field1'], parents['field2'], ...)", description: "Average of numbers" },
  { name: "max(parents['field1'], parents['field2'], ...)", description: "Maximum value" },
  { name: "min(parents['field1'], parents['field2'], ...)", description: "Minimum value" },
  { name: "if(condition, trueVal, falseVal)", description: "Conditional expression helper" },
];

export default function DerivedFieldConfig({
  fields,
  derivedParents,
  setDerivedParents,
  derivedFormula,
  setDerivedFormula,
}: {
  fields: Field[];
  derivedParents: string[];
  setDerivedParents: (parents: string[]) => void;
  derivedFormula: string;
  setDerivedFormula: (formula: string) => void;
}) {
  const formulaInputRef = useRef<HTMLTextAreaElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewResult, setPreviewResult] = useState<any>("");

  const insertAtCursor = (text: string) => {
    const input = formulaInputRef.current;
    if (!input) return;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newFormula = derivedFormula.slice(0, start) + text + derivedFormula.slice(end);
    setDerivedFormula(newFormula);
    window.requestAnimationFrame(() => {
      input.selectionStart = input.selectionEnd = start + text.length;
      input.focus();
    });
  };

  const toggleParent = (label: string) => {
    if (derivedParents.includes(label)) {
      setDerivedParents(derivedParents.filter((pl) => pl !== label));
    } else {
      setDerivedParents([...derivedParents, label]);
    }
  };

  const sampleParents = derivedParents.reduce<Record<string, any>>((acc, label) => {
    const parentField = fields.find((f) => f.label === label);
    if (!parentField) return acc;

    let sampleValue: any = "";
    switch (parentField.type) {
      case "number":
        sampleValue = 10;
        break;
      case "text":
      case "textarea":
        sampleValue = "sample";
        break;
      case "date":
        sampleValue = new Date().toISOString().slice(0, 10);
        break;
      default:
        sampleValue = "";
    }
    acc[label] = sampleValue;
    return acc;
  }, {});

  useEffect(() => {
    if (!derivedFormula.trim()) {
      setError(null);
      setPreviewResult("");
      return;
    }

    try {
      const fn = new Function(
        "parents",
        "computeAge",
        "sum",
        "concat",
        "avg",
        "max",
        "min",
        "ifFn",
        `return ${derivedFormula}`
      );

      const result = fn(
        sampleParents,
        (dob: string) => {
          if (!dob) return null;
          const birthDate = new Date(dob);
          if (isNaN(birthDate.getTime())) return null;
          const ageDifMs = Date.now() - birthDate.getTime();
          const ageDate = new Date(ageDifMs);
          return Math.abs(ageDate.getUTCFullYear() - 1970);
        },
        (...args: any[]) => args.reduce((acc, val) => acc + Number(val || 0), 0),
        (...args: any[]) => args.join(""),
        (...args: any[]) => (args.length === 0 ? 0 : args.reduce((acc, val) => acc + Number(val || 0), 0) / args.length),
        (...args: any[]) => Math.max(...args.map(Number)),
        (...args: any[]) => Math.min(...args.map(Number)),
        (condition: boolean, trueVal: any, falseVal: any) => (condition ? trueVal : falseVal)
      );

      setPreviewResult(result);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      setPreviewResult("");
    }
  }, [derivedFormula, derivedParents]);

  return (
    <div className="mb-6 p-0 sm:p-4 rounded-md border border-yellow-400 bg-yellow-50 max-w-full">
      <h3 className="font-semibold mb-3 text-yellow-700 text-lg text-center sm:text-left">
        Derived Field Configuration
      </h3>

      <div className="mb-3">
        <label className="block mb-1 font-medium text-sm sm:text-base">Select Parent Field(s):</label>
        <div className="flex flex-wrap gap-2 sm:gap-3 max-h-36 sm:max-h-32 overflow-auto border rounded p-2 bg-white">
          {fields
            .filter((f) => !f.derivedFrom)
            .map((f) => (
              <label
                key={f.label}
                className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap text-xs sm:text-sm"
              >
                <input
                  type="checkbox"
                  checked={derivedParents.includes(f.label)}
                  onChange={() => toggleParent(f.label)}
                  className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-yellow-600"
                />
                <span>
                  {f.label} <span className="text-gray-500">({f.type})</span>
                </span>
              </label>
            ))}
        </div>
      </div>

      <label className="block mb-1 font-medium text-sm sm:text-base">Formula / Logic (JS expression):</label>

      {/* Operators */}
      <div className="mb-2 flex flex-wrap gap-1 sm:gap-2 justify-center sm:justify-start">
        {OPERATORS.map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => insertAtCursor(` ${op} `)}
            className="px-2 py-1 sm:px-3 sm:py-1 bg-yellow-300 rounded hover:bg-yellow-400 text-yellow-900 font-mono text-xs sm:text-sm"
            title={`Insert operator "${op}"`}
          >
            {op}
          </button>
        ))}
      </div>

      {/* Helper functions with descriptions */}
      <div
        className="
          mb-4
          flex
          flex-wrap
          gap-1 sm:gap-2
          justify-center
          sm:justify-start
          overflow-x-auto
          px-1 sm:px-2
          text-xs sm:text-sm
        "
      >
        {HELPER_FUNCTIONS_INFO.map((fn) => (
          <button
            key={fn.name}
            type="button"
            onClick={() => insertAtCursor(fn.name)}
            className="
              px-2
              py-1
              bg-yellow-200
              rounded
              hover:bg-yellow-300
              text-yellow-900
              font-mono
              whitespace-normal
              min-w-max
              break-words
              text-xs sm:text-sm
            "
            title={fn.description}
          >
            {fn.name}
          </button>
        ))}
      </div>

      <textarea
        ref={formulaInputRef}
        value={derivedFormula}
        onChange={(e) => setDerivedFormula(e.target.value)}
        placeholder="e.g. parents['Field1'] + parents['Field2']"
        rows={4}
        className={`w-full p-2 border rounded font-mono resize-y transition-colors text-xs sm:text-sm ${
          error ? "border-red-500 bg-red-50" : "border-yellow-400 bg-yellow-50"
        }`}
      />

      {error ? (
        <p className="mt-2 text-xs sm:text-sm text-red-600 font-semibold text-center sm:text-left">
          Syntax Error: {error}
        </p>
      ) : (
        <p className="mt-2 text-xs sm:text-sm text-yellow-900 font-semibold text-center sm:text-left break-words">
          Preview Result: <span className="font-mono">{String(previewResult)}</span>
        </p>
      )}

      <p className="mt-2 text-xs text-gray-600 text-center sm:text-left">
        Use <code>parents</code> object with keys as parent field labels to reference values.
      </p>
    </div>
  );
}
