import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import React from "react";

const theme = createTheme({
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "var(--card)",
          borderRadius: "0.75rem",
          boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
          color: "var(--foreground)",
          "& .MuiTimeClock-root": {
            backgroundColor: "var(--card)",
          },
          "& .MuiClockNumber-root": {
            color: "var(--primary)",
            fontWeight: "500",
            "&.Mui-selected": {
              backgroundColor: "var(--primary)",
              color: "var(--primary-foreground)",
            },
            "&:hover": {
              backgroundColor: "var(--muted)",
            },
          },
          "& .MuiClockPointer-root": {
            backgroundColor: "var(--primary)",
          },
          "& .MuiClockPointer-thumb": {
            backgroundColor: "var(--primary-foreground)",
            borderColor: "var(--primary)",
          },
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "1rem 1.5rem",
          "& .MuiButton-root": {
            color: "var(--sidebar-accent)",
            fontWeight: "500",
            textTransform: "none",
            borderRadius: "0.375rem",
            padding: "0.5rem 1rem",
            "&:hover": {
              backgroundColor: "rgba(59,130,246,0.1)",
            },
          },
        },
      },
    },
  },
});

interface TimePickerProps {
  value?: any;
  onChange?: (value: any) => void;
  onAccept?: (value: any) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  minTime?: any;
  maxTime?: any;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  onAccept,
  label,
  placeholder,
  className,
  minTime,
  maxTime,
}) => {
  return (
    <ThemeProvider theme={theme}>
      <div className={`w-full ${className ?? ""}`.trim()}>
        {label && (
          <label className="block text-sm font-medium mb-1">{label}</label>
        )}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileTimePicker
            value={value}
            onChange={onChange}
            onAccept={onAccept}
            minTime={minTime}
            maxTime={maxTime}
            slotProps={{
              textField: {
                placeholder: placeholder || "Select time",
                className:
                  "w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all",
                InputProps: {
                  style: {
                    border: "none",
                    boxShadow: "none",
                    background: "var(--card)",
                  },
                },
                inputProps: {
                  style: {
                    textAlign: "center",
                  },
                },
              },
            }}
            className="w-full"
          />
        </LocalizationProvider>
      </div>
    </ThemeProvider>
  );
};

export default TimePicker;
