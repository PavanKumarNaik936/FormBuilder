import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { type RootState } from "../app/store";
import {type ValidationRules } from "../features/formBuilder/types";
import {
  addField,
  removeField,
  saveCurrentForm,
} from "../features/formBuilder/formBuilderSlice";
import { toast } from "sonner";
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


const lightGreen = "#a5d6a7";  // lighter green background/focus
const darkGreen = "#2e7d32";   // dark green for text and gradients

export default function CreateFormPage() {
  const dispatch = useDispatch();
  const fields = useSelector(
    (state: RootState) => state.formBuilder.currentFields
  );

  const [type, setType] = useState<FieldType>("text");
  const [label, setLabel] = useState("");
  const [options, setOptions] = useState(""); // comma separated options
  // const [required, setRequired] = useState(false);
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
          // required,
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
          // required,
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
    // setRequired(false);
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
    // console.log(applicableValidations);

    return (
      <div
        className="mb-4 border p-3 rounded-md"
        style={{ backgroundColor: lightGreen, borderColor: darkGreen }}
      >
        <h3 className="font-semibold mb-2" style={{ color: darkGreen }}>
          Validation Rules
        </h3>
        {applicableValidations.includes("notEmpty") && (
          <label
            className="flex items-center gap-2 mb-1"
            style={{ color: darkGreen }}
          >
            <input
              type="checkbox"
              checked={validationRules.required || false}
              onChange={(e) =>
                handleValidationChange("required", e.target.checked)
              }
              className="form-checkbox h-4 w-4"
              style={{ accentColor: darkGreen }}
            />
            Required (Not Empty)
          </label>
        )}

        {applicableValidations.includes("minLength") && (
          <div className="mb-1">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: darkGreen }}
            >
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
              style={{ borderColor: darkGreen }}
            />
          </div>
        )}

        {applicableValidations.includes("maxLength") && (
          <div className="mb-1">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: darkGreen }}
            >
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
              style={{ borderColor: darkGreen }}
            />
          </div>
        )}

        {applicableValidations.includes("email") && (
          <label
            className="flex items-center gap-2 mb-1"
            style={{ color: darkGreen }}
          >
            <input
              type="checkbox"
              checked={validationRules.email || false}
              onChange={(e) => handleValidationChange("email", e.target.checked)}
              className="form-checkbox h-4 w-4"
              style={{ accentColor: darkGreen }}
            />
            Email Format
          </label>
        )}

        {applicableValidations.includes("password") && (
          <label
            className="flex items-center gap-2 mb-1"
            style={{ color: darkGreen }}
          >
            <input
              type="checkbox"
              checked={validationRules.password || false}
              onChange={(e) =>
                handleValidationChange("password", e.target.checked)
              }
              className="form-checkbox h-4 w-4"
              style={{ accentColor: darkGreen }}
            />
            Password Rule (Min 8 chars, number required)
          </label>
        )}

        {applicableValidations.includes("minValue") && (
          <div className="mb-1">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: darkGreen }}
            >
              Min Value:
            </label>
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
              style={{ borderColor: darkGreen }}
            />
          </div>
        )}

        {applicableValidations.includes("maxValue") && (
          <div className="mb-1">
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: darkGreen }}
            >
              Max Value:
            </label>
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
              style={{ borderColor: darkGreen }}
            />
          </div>
        )}
      </div>
    );
  };

  const lightestGreen = "#f7fcf7"; // page bg
  const lighterGreen = "#e6f4e6";  // input bg
  const lightGreenBorder = "#a8d5a8"; // border color
  const mediumGreenText = "#4a7c4a"; // text
  const mediumGreenBorder = "#9ccc9c"; // border (slightly darker)
  const darkGreenBtn = "#388e3c"; // button bg
  const darkGreenBtnHover = "#2e7d32"; // button hover
  const disabledGreen = "#d4e8d4"; // disabled button bg
  
  return (
    <div
      className="flex justify-center min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-4 sm:p-6 md:p-10"
      style={{ backgroundColor: lightestGreen }}
    >
      <GlowingCard>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-3xl"
        >
          <div
            className="bg-white shadow-lg rounded-2xl p-6 border backdrop-blur-sm"
            style={{ borderColor: lightGreenBorder }}
          >
            <h2
              className="text-3xl font-bold mb-8 text-center"
              style={{ color: mediumGreenText }}
            >
              🛠 Create Form
            </h2>
  
            {/* Field Type & Label */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <select
                value={type}
                onChange={handleTypeChange}
                className="px-4 py-3 border rounded-lg shadow-sm focus:ring-2 outline-none w-full sm:w-40"
                style={{ borderColor: mediumGreenBorder, backgroundColor: lighterGreen, color: mediumGreenText }}
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
                className="flex-1 px-4 py-3 border rounded-lg shadow-sm outline-none w-full sm:w-auto"
                style={{ borderColor: mediumGreenBorder, backgroundColor: lighterGreen, color: mediumGreenText }}
              />
            </div>
  
            {/* Options input for multi-option types */}
            {multiOptionTypes.includes(type) && (
              <div className="mb-4">
                <input
                  value={options}
                  onChange={(e) => setOptions(e.target.value)}
                  placeholder="Options (comma separated)"
                  className="w-full px-4 py-2 border rounded-lg shadow-sm outline-none"
                  onBlur={() =>
                    setOptions(
                      options
                        .split(",")
                        .map((opt) => opt.trim())
                        .filter(Boolean)
                        .join(", ")
                    )
                  }
                  style={{ borderColor: mediumGreenBorder, backgroundColor: lighterGreen, color: mediumGreenText }}
                />
                <p className="text-sm mt-1" style={{ color: mediumGreenText }}>
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
                className="w-full px-4 py-2 border rounded-lg shadow-sm outline-none"
                style={{ borderColor: mediumGreenBorder, backgroundColor: lighterGreen, color: mediumGreenText }}
              />
            </div>
  
            {/* Required toggle */}
            {/* <label className="flex items-center gap-3 mb-4" style={{ color: mediumGreenText }}>
              <input
                type="checkbox"
                checked={required}
                onChange={() => setRequired(!required)}
                className="form-checkbox h-5 w-5"
                style={{ accentColor: darkGreenBtn }}
              />
              <span className="select-none font-semibold">Required</span>
            </label> */}
  
            {/* Validation rules */}
            {renderValidationInputs()}
  
            {/* Derived field toggle */}
            <label className="flex items-center gap-3 mb-4" style={{ color: "#fbc02d" }}>
              <input
                type="checkbox"
                checked={isDerived}
                onChange={() => setIsDerived(!isDerived)}
                className="form-checkbox h-5 w-5"
                disabled={multiOptionTypes.includes(type)}
                title={
                  multiOptionTypes.includes(type)
                    ? "Derived fields not supported for this type"
                    : undefined
                }
                style={{ accentColor: "#fbc02d" }}
              />
              <span className="select-none font-semibold">Mark as Derived Field</span>
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
              className="w-full py-3 rounded-lg shadow-md transition-all mb-8 text-white font-semibold"
              style={{
                backgroundColor: isAddDisabled ? disabledGreen : darkGreenBtn,
                cursor: isAddDisabled ? "not-allowed" : "pointer",
                filter: isAddDisabled ? "brightness(1.2)" : undefined,
              }}
              onMouseOver={(e) => {
                if (!isAddDisabled) e.currentTarget.style.backgroundColor = darkGreenBtnHover;
              }}
              onMouseOut={(e) => {
                if (!isAddDisabled) e.currentTarget.style.backgroundColor = darkGreenBtn;
              }}
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
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-green-50 p-4 rounded-lg border hover:shadow-sm transition"
                      style={{ borderColor: lightGreenBorder, color: mediumGreenText }}
                    >
                      <div className="w-full sm:w-auto mb-2 sm:mb-0">
                        <span className="font-semibold text-lg">{f.label}</span>{" "}
                        <span className="text-sm italic" style={{ color: mediumGreenText }}>
                          ({f.type})
                        </span>
                        {f.validations?.required && (
                          <p className="font-semibold text-sm mt-1" style={{ color: darkGreenBtn }}>
                            Required
                          </p>
                        )}
                        {f.options && (
                          <p className="text-sm mt-1" style={{ color: mediumGreenText }}>
                            Options: {f.options.join(", ")}
                          </p>
                        )}
                        {f.defaultValue !== undefined && f.defaultValue !== "" && (
                          <p className="text-sm mt-1" style={{ color: mediumGreenText }}>
                            Default Value: {f.defaultValue}
                          </p>
                        )}
                        {f.validations && (
                          <p className="text-sm mt-1" style={{ color: mediumGreenText }}>
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
                          <p className="text-sm mt-1" style={{ color: "#fbc02d" }}>
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
                        className="font-bold mt-3 sm:mt-0"
                        style={{ color: "#c62828" }}
                        onMouseOver={(e) => (e.currentTarget.style.color = "#b71c1c")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "#c62828")}
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
                className="flex-1 px-4 py-3 border rounded-lg shadow-sm outline-none w-full"
                style={{ borderColor: mediumGreenBorder, backgroundColor: lighterGreen, color: mediumGreenText }}
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
                className="w-full sm:w-auto px-6 py-3 rounded-lg font-semibold text-white shadow-md transition duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-opacity-50"
                style={{
                  background: formName.trim()
                    ? `linear-gradient(90deg, ${darkGreenBtn}, ${darkGreenBtnHover})`
                    : disabledGreen,
                  cursor: formName.trim() ? "pointer" : "not-allowed",
                  opacity: formName.trim() ? 1 : 0.5,
                  boxShadow: formName.trim() ? `0 0 10px ${lighterGreen}` : undefined,
                }}
                onMouseOver={(e) => {
                  if (formName.trim()) {
                    e.currentTarget.style.background = darkGreenBtnHover;
                  }
                }}
                onMouseOut={(e) => {
                  if (formName.trim()) {
                    e.currentTarget.style.background = `linear-gradient(90deg, ${darkGreenBtn}, ${darkGreenBtnHover})`;
                  }
                }}
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
