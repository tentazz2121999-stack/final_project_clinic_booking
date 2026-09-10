import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#1565c0" },
    secondary: { main: "#00897b" },
    background: { default: "#f4f6f8" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: ['"Inter"', "Roboto", "Arial", "sans-serif"].join(","),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
      },
    },
  },
});

export default theme;
