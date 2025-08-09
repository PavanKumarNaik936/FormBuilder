import { useSelector } from "react-redux";
import { type RootState } from "../app/store";
import { useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { type Field } from "../features/formBuilder/types";
import { toast } from "sonner";
import GlowingCard from "../features/formBuilder/components/GlowingCard";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormGroup,
  FormLabel,
} from "@mui/material";
import { motion } from "framer-motion";

// Helper functions used inside formulas
const computeAge = (dob: string | null) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const ageDifMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageDifMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};
const sum = (...args: any[]) => args.reduce((a, b) => a + Number(b || 0), 0);
const concat = (...args: any[]) => args.join("");
const avg = (...args: any[]) => (args.length === 0 ? 0 : sum(...args) / args.length);
const max = (...args: any[]) => Math.max(...args.map(Number));
const min = (...args: any[]) => Math.min(...args.map(Number));
const ifFn = (condition: boolean, trueVal: any, falseVal: any) => (condition ? trueVal : falseVal);

export default function PreviewFormPage() {
  const [params] = useSearchParams();
  const id = params.get("id");

  const forms = useSelector((state: RootState) => state.formBuilder.savedForms);
  const form = forms.find((f) => f.id === id);

  // Separate states for user input values, derived values, and errors
  const [inputValues, setInputValues] = useState<Record<string, any>>({});
  const [derivedValues, setDerivedValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation function
  const validateField = (field: Field, value: any): string => {
    const v = field.validations || {};
    const val = value ?? "";

    // Required check (consolidate with validations.required)
    const isRequired = v.required ?? field.required ?? false;
    if (isRequired) {
      if (
        val === "" ||
        val === null ||
        val === undefined ||
        (Array.isArray(val) && val.length === 0)
      ) {
        return "This field is required";
      }
    }

    // minLength/maxLength for strings
    if (typeof val === "string") {
      if (v.minLength && val.length < v.minLength) {
        return `Minimum length is ${v.minLength}`;
      }
      if (v.maxLength && val.length > v.maxLength) {
        return `Maximum length is ${v.maxLength}`;
      }
    }

    // Email validation
    if (v.email && typeof val === "string" && val) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        return "Invalid email address";
      }
    }

    // Password rule validation (example: min 8 chars, at least 1 digit)
    if (v.passwordRule && typeof val === "string" && val) {
      const passwordRegex = /^(?=.*\d).{8,}$/;
      if (!passwordRegex.test(val)) {
        return "Password must be at least 8 characters and include a number";
      }
    }

    return "";
  };

  // Initialize inputValues on form load (only non-derived fields)
  useEffect(() => {
    if (!form) return;

    const initialInputValues: Record<string, any> = {};
    form.fields.forEach((field) => {
      if (!field.derivedFrom) {
        initialInputValues[field.label] = field.defaultValue ?? "";
      }
    });
    setInputValues(initialInputValues);
    setDerivedValues({});
    setErrors({}); // clear errors on form load
  }, [form]);

  // Compute derived values when inputValues or form changes
  useEffect(() => {
    if (!form) return;

    const newDerivedValues: Record<string, any> = {};
    let changed = false;

    form.fields
      .filter((f) => f.derivedFrom && f.formula)
      .forEach((field) => {
        try {
          const parents: Record<string, any> = {};

          field.derivedFrom!.forEach((parentLabel) => {
            parents[parentLabel] =
              inputValues[parentLabel] ?? derivedValues[parentLabel] ?? "";
          });

          const formulaFn = new Function(
            "parents",
            "computeAge",
            "sum",
            "concat",
            "avg",
            "max",
            "min",
            "ifFn",
            `return ${field.formula};`
          );

          const result = formulaFn(parents, computeAge, sum, concat, avg, max, min, ifFn);

          const safeResult =
            result === null || result === undefined || Number.isNaN(result) ? "" : result;

          if (newDerivedValues[field.label] !== safeResult) {
            newDerivedValues[field.label] = safeResult;
            changed = true;
          }
        } catch {
          if (newDerivedValues[field.label] !== "") {
            newDerivedValues[field.label] = "";
            changed = true;
          }
        }
      });

    if (changed) {
      setDerivedValues(newDerivedValues);
    }
  }, [inputValues, form]);

  if (!form) {
    return (
      <Box className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Typography variant="h6" color="error">
          Form not found.
        </Typography>
      </Box>
    );
  }

  // Update input values keyed by label on input change
  const handleChange = (fieldId: string, value: any) => {
    if (!form) return;
    const field = form.fields.find((f) => f.id === fieldId);
    if (!field || field.derivedFrom) return; // Prevent editing derived fields

    setInputValues((prev) => ({ ...prev, [field.label]: value }));

    // validate on change
    const errorMsg = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field.label]: errorMsg }));
  };

  // Combine input + derived values for rendering
  const combinedValues = { ...derivedValues, ...inputValues };

  // Check if form is valid (no errors & required fields filled)
  const isFormValid = () => {
    for (const field of form.fields) {
      if (!field.isDerived) {
        const val = inputValues[field.label];
        const error = validateField(field, val);
        if (error) return false;
      }
    }
    return true;
  };

  // Render input field with error handling
  const renderField = (f: Field) => {
    const isDerived = !!f.derivedFrom;
    const fieldValue = combinedValues[f.label] ?? "";
    const errorMsg = errors[f.label] || "";
    const hasError = errorMsg !== "";

    switch (f.type) {
      case "textarea":
        return (
          <TextField
            fullWidth
            label={f.label}
            variant="outlined"
            size="small"
            multiline
            minRows={3}
            value={fieldValue}
            onChange={(e) => handleChange(f.id, e.target.value)}
            disabled={isDerived}
            error={hasError}
            helperText={errorMsg}
            className="bg-white rounded-md shadow-sm hover:shadow-md transition-all"
          />
        );

      case "select":
        return (
          <TextField
            select
            fullWidth
            label={f.label}
            variant="outlined"
            size="small"
            value={fieldValue}
            onChange={(e) => handleChange(f.id, e.target.value)}
            disabled={isDerived}
            error={hasError}
            helperText={errorMsg}
            className="bg-white rounded-md shadow-sm hover:shadow-md transition-all"
          >
            {(f.options || []).map((opt: string, idx: number) => (
              <MenuItem key={idx} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
        );

      case "checkbox":
        return (
          <FormGroup sx={{ flexDirection: "row", gap: 2 }}>
            <FormLabel
              component="legend"
              className="mb-1 font-semibold text-gray-700"
              sx={{ width: "100%" }}
            >
              {f.label}
            </FormLabel>
            {(f.options || []).map((opt: string, idx: number) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    checked={fieldValue?.includes(opt) || false}
                    onChange={(e) => {
                      if (isDerived) return;
                      const checked = e.target.checked;
                      setInputValues((prev) => {
                        const current = prev[f.label] || [];
                        return {
                          ...prev,
                          [f.label]: checked
                            ? [...current, opt]
                            : current.filter((o: string) => o !== opt),
                        };
                      });

                      // Validate after updating checkbox value
                      const newValue = e.target.checked
                        ? [...(fieldValue || []), opt]
                        : (fieldValue || []).filter((o: string) => o !== opt);
                      const errorMsg = validateField(f, newValue);
                      setErrors((prev) => ({ ...prev, [f.label]: errorMsg }));
                    }}
                  />
                }
                label={opt}
                sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.95rem", color: "#444" } }}
              />
            ))}
            {hasError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errorMsg}
              </Typography>
            )}
          </FormGroup>
        );

      case "radio":
        return (
          <Box>
            <FormLabel
              component="legend"
              className="mb-1 font-semibold text-gray-700"
              sx={{ mb: 1 }}
            >
              {f.label}
            </FormLabel>
            <RadioGroup
              value={fieldValue}
              onChange={(e) => {
                if (isDerived) return;
                handleChange(f.id, e.target.value);
              }}
              sx={{ flexDirection: "row", gap: 2 }}
            >
              {(f.options || []).map((opt: string, idx: number) => (
                <FormControlLabel
                  key={idx}
                  value={opt}
                  control={<Radio />}
                  label={opt}
                  sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.95rem", color: "#444" } }}
                />
              ))}
            </RadioGroup>
            {hasError && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errorMsg}
              </Typography>
            )}
          </Box>
        );

      default:
        if (f.type === "date") {
          return (
            <TextField
              fullWidth
              label={f.label}
              variant="outlined"
              size="small"
              type="date"
              value={fieldValue}
              onChange={(e) => handleChange(f.id, e.target.value)}
              disabled={isDerived}
              error={hasError}
              helperText={errorMsg}
              className="bg-white rounded-md shadow-sm hover:shadow-md transition-all"
              InputLabelProps={{ shrink: true }}
            />
          );
        }
        return (
          <TextField
            fullWidth
            label={f.label}
            variant="outlined"
            size="small"
            type={f.type}
            value={fieldValue}
            onChange={(e) => handleChange(f.id, e.target.value)}
            disabled={isDerived}
            error={hasError}
            helperText={errorMsg}
            className="bg-white rounded-md shadow-sm hover:shadow-md transition-all"
          />
        );
    }
  };

  const handleSubmit = () => {
    if (!form) return;

    if (!isFormValid()) {
      toast.error("Please fix errors before submitting.");
      return;
    }

    // Combine input and derived values on submit
    const labeledValues: Record<string, any> = {};
    form.fields.forEach((field) => {
      labeledValues[field.label] = combinedValues[field.label];
    });

    console.log("Form values submitted with labels:", labeledValues);
    toast.success("Form submitted! Check console for labeled values.");

  };

  return (
    <Box className="flex justify-center  bg-gradient-to-br from-gray-50 to-blue-50 p-2" >
      <GlowingCard>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ maxWidth: 650, width: "100%" }}
      >
        <Paper
          elevation={3}
          className="w-full p-6 rounded-2xl shadow-lg backdrop-blur-md bg-white/95 border border-gray-200"
        >
          <Typography variant="h5" className="mb-6 font-semibold text-center text-gray-900">
            {form.name}
          </Typography>

          <Box component="form" noValidate autoComplete="off" sx={{ gap: 3 }}>
            <div className="space-y-5">
              {form.fields.map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {renderField(f)}
                </motion.div>
              ))}
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                size="medium"
                sx={{
                  mt: 6,
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  boxShadow: "0 4px 10px rgb(0 123 255 / 0.4), 0 0 15px rgb(0 123 255 / 0.2)",
                }}
                onClick={handleSubmit}
                disabled={!isFormValid()}
              >
                Submit
              </Button>
            </motion.div>
            
          </Box>
        </Paper>
        
      </motion.div>
      </GlowingCard>
    </Box>
  );
}
