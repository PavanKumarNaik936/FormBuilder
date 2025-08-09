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

const lightestGreen = "#f7fcf7"; // page bg
const lighterGreen = "#e6f4e6";  // input bg
const lightGreenBorder = "#a8d5a8"; // border color
const mediumGreenText = "#4a7c4a"; // text
// const mediumGreenBorder = "#9ccc9c"; // border (slightly darker)
const darkGreenBtn = "#388e3c"; // button bg
const darkGreenBtnHover = "#2e7d32"; // button hover
const disabledGreen = "#d4e8d4"; // disabled button bg

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
  
    const commonTextFieldSx = {
      backgroundColor: lighterGreen,
      borderRadius: 1,
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: hasError ? "#d32f2f" : lightGreenBorder,
        },
        "&:hover fieldset": {
          borderColor: hasError ? "#d32f2f" : mediumGreenText,
        },
        "&.Mui-focused fieldset": {
          borderColor: hasError ? "#d32f2f" : darkGreenBtn,
          borderWidth: 2,
        },
        color: mediumGreenText,
      },
      "& .MuiInputLabel-root": {
        color: mediumGreenText,
        "&.Mui-focused": {
          color: darkGreenBtn,
        },
      },
      "& .MuiFormHelperText-root": {
        color: hasError ? "#d32f2f" : mediumGreenText,
      },
    };
  
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
            sx={commonTextFieldSx}
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
            sx={commonTextFieldSx}
          >
            {(f.options || []).map((opt: string, idx: number) => (
              <MenuItem key={idx} value={opt} sx={{ color: mediumGreenText }}>
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
              sx={{ width: "100%", mb: 1, fontWeight: "600", color: mediumGreenText }}
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
  
                      const newValue = e.target.checked
                        ? [...(fieldValue || []), opt]
                        : (fieldValue || []).filter((o: string) => o !== opt);
                      const errorMsg = validateField(f, newValue);
                      setErrors((prev) => ({ ...prev, [f.label]: errorMsg }));
                    }}
                    sx={{
                      color: darkGreenBtn,
                      "&.Mui-checked": {
                        color: darkGreenBtn,
                      },
                      "&.Mui-disabled": {
                        color: disabledGreen,
                      },
                    }}
                    disabled={isDerived}
                  />
                }
                label={opt}
                sx={{
                  "& .MuiFormControlLabel-label": { fontSize: "0.95rem", color: mediumGreenText },
                }}
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
              sx={{ mb: 1, fontWeight: "600", color: mediumGreenText }}
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
                  control={
                    <Radio
                      sx={{
                        color: darkGreenBtn,
                        "&.Mui-checked": {
                          color: darkGreenBtn,
                        },
                        "&.Mui-disabled": {
                          color: disabledGreen,
                        },
                      }}
                      disabled={isDerived}
                    />
                  }
                  label={opt}
                  sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.95rem", color: mediumGreenText } }}
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
              InputLabelProps={{ shrink: true }}
              sx={commonTextFieldSx}
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
            sx={commonTextFieldSx}
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
    <Box
      className="flex justify-center p-2"
      sx={{
        background: `linear-gradient(to bottom right, ${lightestGreen}, ${lighterGreen})`,
        minHeight: "100vh",
      }}
    >
      <GlowingCard>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ maxWidth: 650, width: "100%" }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 6,
              borderRadius: 4,
              boxShadow:
                "0 10px 30px rgba(72,187,120,0.2)",
              backdropFilter: "blur(12px)",
              backgroundColor: "rgba(255 255 255 / 0.95)",
              border: `1.5px solid ${lightGreenBorder}`,
              color: mediumGreenText,
            }}
          >
            <Typography
              variant="h5"
              className="mb-6 font-semibold text-center"
              sx={{ color: mediumGreenText }}
            >
              {form.name}
            </Typography>

            <Box
              component="form"
              noValidate
              autoComplete="off"
              sx={{ gap: 3 }}
            >
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

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  size="medium"
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                  sx={{
                    mt: 6,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    backgroundColor: darkGreenBtn,
                    boxShadow:
                      "0 4px 10px rgba(56,142,60,0.4), 0 0 15px rgba(56,142,60,0.2)",
                    "&:hover": {
                      backgroundColor: darkGreenBtnHover,
                      boxShadow:
                        "0 6px 14px rgba(46,125,50,0.6), 0 0 20px rgba(46,125,50,0.3)",
                    },
                    "&:disabled": {
                      backgroundColor: disabledGreen,
                      boxShadow: "none",
                      color: mediumGreenText,
                      cursor: "not-allowed",
                      opacity: 0.7,
                    },
                  }}
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
