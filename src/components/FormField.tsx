import {
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import * as React from "react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
  type?: "text" | "select" | "number";
  value: string | number;
  onChange: (value: string | number) => void;
  options?: Array<{
    value: string | number;
    label: string;
    icon?: React.ReactNode;
  }>;
  placeholder?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  sx?: SxProps<Theme>;
}

const MotionBox = motion.create(Box);

export default function FormField({
  label,
  required = false,
  error = false,
  helperText,
  type = "text",
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  fullWidth = true,
  sx,
}: FormFieldProps) {
  const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        width: fullWidth ? "100%" : "auto",
        height: "100%", // Assurer une hauteur uniforme
        display: "flex",
        flexDirection: "column",
        ...sx,
      }}
    >
      <FormControl
        fullWidth={fullWidth}
        error={error}
        disabled={disabled}
        sx={{
          height: "100%", // Prendre toute la hauteur disponible
          display: "flex",
          flexDirection: "column",
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: "background.paper",
            transition: "all 0.2s ease-in-out",
            minHeight: 56, // Hauteur uniforme pour tous les champs
            "&:hover": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: error ? "error.main" : "primary.main",
                borderWidth: "2px",
              },
            },
            "&.Mui-focused": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: error ? "error.main" : "primary.main",
                borderWidth: "2px",
              },
            },
          },
          "& .MuiInputLabel-root": {
            color: "text.secondary",
            fontWeight: 500,
            "&.Mui-focused": {
              color: error ? "error.main" : "primary.main",
            },
          },
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            gap: 1,
            minHeight: 56, // Hauteur uniforme
            padding: "16px 14px", // Padding uniforme
          },
        }}
      >
        {type === "select" ? (
          <>
            <InputLabel id={`${fieldId}-label`}>
              {label} {required && "*"}
            </InputLabel>
            <Select
              labelId={`${fieldId}-label`}
              id={fieldId}
              value={value.toString()}
              onChange={handleSelectChange}
              label={`${label} ${required ? "*" : ""}`}
              aria-describedby={
                helperText ? `${fieldId}-helper-text` : undefined
              }
              MenuProps={{
                PaperProps: {
                  sx: {
                    borderRadius: 2,
                    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
                    border: "1px solid",
                    borderColor: "divider",
                  },
                },
              }}
              renderValue={(selected) => {
                const option = options.find(
                  (opt) => opt.value.toString() === selected
                );
                return (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    {option?.icon && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 20,
                          height: 20,
                          flexShrink: 0,
                        }}
                        aria-hidden="true"
                      >
                        {option.icon}
                      </Box>
                    )}
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {option?.label || selected}
                    </Typography>
                  </Box>
                );
              }}
            >
              {options.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1.5,
                    minHeight: 48, // Hauteur uniforme pour tous les items
                    "&:hover": {
                      backgroundColor: "primary.50",
                    },
                  }}
                >
                  {option.icon && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 20,
                        height: 20,
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    >
                      {option.icon}
                    </Box>
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      textAlign: "left",
                    }}
                  >
                    {option.label}
                  </Typography>
                </MenuItem>
              ))}
            </Select>
          </>
        ) : (
          <TextField
            id={fieldId}
            label={`${label} ${required ? "*" : ""}`}
            value={value}
            onChange={handleTextChange}
            type={type}
            placeholder={placeholder}
            fullWidth={fullWidth}
            variant="outlined"
            aria-describedby={helperText ? `${fieldId}-helper-text` : undefined}
            sx={{
              "& .MuiInputBase-input": {
                fontSize: "0.875rem",
                minHeight: 56, // Hauteur uniforme
              },
            }}
          />
        )}

        {helperText && (
          <FormHelperText
            id={`${fieldId}-helper-text`}
            sx={{
              mt: 1,
              fontSize: "0.75rem",
              color: error ? "error.main" : "text.secondary",
            }}
          >
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    </MotionBox>
  );
}
