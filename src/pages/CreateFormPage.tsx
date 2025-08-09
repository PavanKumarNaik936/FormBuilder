import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "../app/store";
import {
  addField,
  removeField,
  // updateField,
  saveCurrentForm,
} from "../features/formBuilder/formBuilderSlice";
import {toast} from 'sonner'
import { type FieldType } from "../features/formBuilder/types";
import { motion, AnimatePresence } from "framer-motion";
import DerivedFieldConfig from "../features/formBuilder/components/DerivedFieldConfig";
import GlowingCard from "../features/formBuilder/components/GlowingCard";
const multiOptionTypes = ["select", "radio", "checkbox"];

const validationOptionsByType = {
  text: ["notEmpty", "minLength", "maxLength", "email", "password"],
  number: ["notEmpty", "minValue", "maxValue"],
  textarea: ["notEmpty", "minLength", "maxLength"],
  select: ["notEmpty"],
  radio: ["notEmpty"],
  checkbox: ["notEmpty"],
  date: ["notEmpty"],
};

interface ValidationRules {
  notEmpty?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  email?: boolean;
  password?: boolean;
}

export default function CreateFormPage() {
  const dispatch = useDispatch();
  const fields = useSelector(
    (state: RootState) => state.formBuilder.currentFields
  );

  const [type, setType] = useState<FieldType>("text");
  const [label, setLabel] = useState("");
  const [options, setOptions] = useState(""); // comma separated options
  const [required, setRequired] = useState(false);
  const [defaultValue, setDefaultValue] = useState<string>("");
  const [validationRules, setValidationRules] = useState<ValidationRules>({});
  const [isDerived, setIsDerived] = useState(false);
  const [derivedParents, setDerivedParents] = useState<string[]>([]);
  const [derivedFormula, setDerivedFormula] = useState("");
  const [formName, setFormName] = useState("");

  useEffect(() => {
    setValidationRules({});
    setIsDerived(false);
    setDerivedParents([]);
    setDerivedFormula("");
    setDefaultValue("");
    if (!multiOptionTypes.includes(type)) {
      setOptions("");
    }
  }, [type]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setType(e.target.value as FieldType);
  };

  const handleValidationChange = (
    key: keyof ValidationRules,
    value: boolean | number | undefined
  ) => {
    setValidationRules((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleAdd = () => {
    if (!label.trim()) {
      toast.error("Label is required");
      return;
    }

    if (multiOptionTypes.includes(type)) {
      const optsArray = options
        .split(",")
        .map((opt) => opt.trim())
        .filter(Boolean);
      if (optsArray.length === 0) {
        toast.error("Please add at least one option.");
        return;
      }
      if (isDerived) {
        toast.error("Derived fields cannot be of type select/radio/checkbox for this demo.");
        return;
      }
      dispatch(
        addField({
          type,
          label,
          options: optsArray,
          required,
          defaultValue,
          validations: validationRules,
          derivedFrom: isDerived ? derivedParents : undefined,
          formula: isDerived ? derivedFormula : undefined,
        })
      );
    } else {
      dispatch(
        addField({
          type,
          label,
          required,
          defaultValue,
          validations: validationRules,
          derivedFrom: isDerived ? derivedParents : undefined,
          formula: isDerived ? derivedFormula : undefined,
        })
      );
    }

    // Reset inputs
    setLabel("");
    setOptions("");
    setRequired(false);
    setDefaultValue("");
    setValidationRules({});
    setIsDerived(false);
    setDerivedParents([]);
    setDerivedFormula("");
  };

  const isAddDisabled =
    !label.trim() ||
    (multiOptionTypes.includes(type) &&
      options.split(",").filter((opt) => opt.trim() !== "").length === 0) ||
    (isDerived && derivedParents.length === 0) ||
    (isDerived && !derivedFormula.trim());

  const renderValidationInputs = () => {
    const applicableValidations = validationOptionsByType[type] || [];

    return (
      <div className="mb-4 border p-3 rounded-md bg-gray-50">
        <h3 className="font-semibold mb-2">Validation Rules</h3>
        {applicableValidations.includes("notEmpty") && (
          <label className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={validationRules.notEmpty || false}
              onChange={(e) =>
                handleValidationChange("notEmpty", e.target.checked)
              }
              className="form-checkbox h-4 w-4"
            />
            Required (Not Empty)
          </label>
        )}

        {applicableValidations.includes("minLength") && (
          <div className="mb-1">
            <label className="block text-sm font-medium mb-1">
              Minimum Length:
            </label>
            <input
              type="number"
              min={0}
              value={validationRules.minLength ?? ""}
              onChange={(e) =>
                handleValidationChange(
                  "minLength",
                  e.target.value === "" ? undefined : +e.target.value
                )
              }
              className="w-full px-2 py-1 border rounded"
              placeholder="e.g. 3"
            />
          </div>
        )}

        {applicableValidations.includes("maxLength") && (
          <div className="mb-1">
            <label className="block text-sm font-medium mb-1">
              Maximum Length:
            </label>
            <input
              type="number"
              min={0}
              value={validationRules.maxLength ?? ""}
              onChange={(e) =>
                handleValidationChange(
                  "maxLength",
                  e.target.value === "" ? undefined : +e.target.value
                )
              }
              className="w-full px-2 py-1 border rounded"
              placeholder="e.g. 10"
            />
          </div>
        )}

        {applicableValidations.includes("email") && (
          <label className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={validationRules.email || false}
              onChange={(e) => handleValidationChange("email", e.target.checked)}
              className="form-checkbox h-4 w-4"
            />
            Email Format
          </label>
        )}

        {applicableValidations.includes("password") && (
          <label className="flex items-center gap-2 mb-1">
            <input
              type="checkbox"
              checked={validationRules.password || false}
              onChange={(e) =>
                handleValidationChange("password", e.target.checked)
              }
              className="form-checkbox h-4 w-4"
            />
            Password Rule (Min 8 chars, number required)
          </label>
        )}

        {applicableValidations.includes("minValue") && (
          <div className="mb-1">
            <label className="block text-sm font-medium mb-1">Min Value:</label>
            <input
              type="number"
              value={validationRules.minValue ?? ""}
              onChange={(e) =>
                handleValidationChange(
                  "minValue",
                  e.target.value === "" ? undefined : +e.target.value
                )
              }
              className="w-full px-2 py-1 border rounded"
              placeholder="e.g. 1"
            />
          </div>
        )}

        {applicableValidations.includes("maxValue") && (
          <div className="mb-1">
            <label className="block text-sm font-medium mb-1">Max Value:</label>
            <input
              type="number"
              value={validationRules.maxValue ?? ""}
              onChange={(e) =>
                handleValidationChange(
                  "maxValue",
                  e.target.value === "" ? undefined : +e.target.value
                )
              }
              className="w-full px-2 py-1 border rounded"
              placeholder="e.g. 100"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    
    <div className="flex justify-center min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-10">
      <GlowingCard>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl"
      >
        <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-100 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            🛠 Create Form
          </h2>

          {/* Field Type & Label */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <select
              value={type}
              onChange={handleTypeChange}
              className="px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 w-full sm:w-40"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="textarea">Textarea</option>
              <option value="select">Select</option>
              <option value="radio">Radio</option>
              <option value="checkbox">Checkbox</option>
              <option value="date">Date</option>
            </select>

            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Field Label"
              className="flex-1 px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 w-full sm:w-auto"
            />
          </div>

          {/* Options input for multi-option types */}
          {multiOptionTypes.includes(type) && (
            <div className="mb-4">
              <input
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="Options (comma separated)"
                className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                onBlur={() =>
                  setOptions(
                    options
                      .split(",")
                      .map((opt) => opt.trim())
                      .filter(Boolean)
                      .join(", ")
                  )
                }
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter options separated by commas, e.g. <code>Red, Blue, Green</code>
              </p>
            </div>
          )}

          {/* Default Value input */}
          <div className="mb-4">
            <input
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="Default Value"
              className="w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
            />
          </div>

          {/* Required toggle */}
          <label className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              checked={required}
              onChange={() => setRequired(!required)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="text-gray-700 select-none font-semibold">Required</span>
          </label>

          {/* Validation rules */}
          {renderValidationInputs()}

          {/* Derived field toggle */}
          <label className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              checked={isDerived}
              onChange={() => setIsDerived(!isDerived)}
              className="form-checkbox h-5 w-5 text-yellow-600"
              disabled={multiOptionTypes.includes(type)}
              title={
                multiOptionTypes.includes(type)
                  ? "Derived fields not supported for this type"
                  : undefined
              }
            />
            <span className="text-yellow-700 select-none font-semibold">
              Mark as Derived Field
            </span>
          </label>

          {/* Derived field config */}
          {isDerived && !multiOptionTypes.includes(type) && (
            <DerivedFieldConfig
              fields={fields}
              derivedParents={derivedParents}
              setDerivedParents={setDerivedParents}
              derivedFormula={derivedFormula}
              setDerivedFormula={setDerivedFormula}
            />
          )}

          {/* Add Field button */}
          <button
            onClick={handleAdd}
            disabled={isAddDisabled}
            className={`w-full py-3 rounded-lg shadow-md transition-all mb-8 text-white font-semibold ${
              isAddDisabled ? "bg-gray-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            ➕ Add Field
          </button>

          {/* Current Fields List */}
          <AnimatePresence>
            {fields.length > 0 && (
              <ul className="space-y-3 mb-6">
                {fields.map((f) => (
                  <motion.li
                    key={f.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-50 p-4 rounded-lg border hover:shadow-sm transition"
                  >
                    <div className="w-full sm:w-auto mb-2 sm:mb-0">
                      <span className="font-semibold text-gray-800 text-lg">
                        {f.label}
                      </span>{" "}
                      <span className="text-gray-500 text-sm italic">({f.type})</span>
                      {f.required && (
                        <p className="text-green-600 font-semibold text-sm mt-1">Required</p>
                      )}
                      {f.options && (
                        <p className="text-gray-600 text-sm mt-1">
                          Options: {f.options.join(", ")}
                        </p>
                      )}
                      {f.defaultValue !== undefined && f.defaultValue !== "" && (
                        <p className="text-gray-600 text-sm mt-1">
                          Default Value: {f.defaultValue}
                        </p>
                      )}
                      {f.validations && (
                        <p className="text-blue-600 text-sm mt-1">
                          Validations:{" "}
                          {Object.entries(f.validations)
                            .filter(([, val]) => val !== undefined && val !== false)
                            .map(([key, val]) => (
                              <span key={key} className="mr-2">
                                {key}
                                {typeof val !== "boolean" ? `: ${val}` : ""}
                              </span>
                            ))}
                        </p>
                      )}
                      {f.derivedFrom && (
                        <p className="text-yellow-700 text-sm mt-1">
                          Derived from:{" "}
                          {f.derivedFrom
                            .map((id) => {
                              const parent = fields.find((fld) => fld.id === id);
                              return parent ? parent.label : id;
                            })
                            .join(", ")}
                          <br />
                          Formula: <code>{f.formula}</code>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => dispatch(removeField(f.id))}
                      className="text-red-600 hover:text-red-800 font-bold mt-3 sm:mt-0"
                    >
                      ✖ Remove
                    </button>
                  </motion.li>
                ))}
              </ul>
            )}
          </AnimatePresence>

          {/* Save Form Section */}
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Form Name"
              className="flex-1 px-4 py-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 w-full"
            />
            <button
            onClick={() => {
              if (!formName.trim()) {
                alert("Please enter a form name");
                return;
              }
              dispatch(saveCurrentForm(formName));
              toast.success("✅ Form saved successfully!");
              setFormName("");
            }}
            disabled={!formName.trim()}
            className={`
              w-full sm:w-auto
              px-6 py-3
              rounded-lg
              font-semibold
              text-white
              shadow-md
              transition
              duration-300
              ease-in-out
              focus:outline-none
              focus:ring-4
              focus:ring-green-400
              focus:ring-opacity-50
              ${
                formName.trim()
                  ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  : "bg-green-300 cursor-not-allowed"
              }
              disabled:opacity-50
            `}
          >
            💾 Save Form
          </button>

          </div>
        </div>
       
      </motion.div>
      </GlowingCard>
    </div>
  
  );
}
