import { ThemeOptions } from "@mui/material/styles";

const BODY_FONT_FAMILY = "'Source Sans 3', 'Open Sans', sans-serif";
const HEADING_FONT_FAMILY = "'Libre Baskerville', Georgia, serif";

const sharedComponents: ThemeOptions["components"] = {
  MuiButton: {
    styleOverrides: {
      root: {
        padding: "6px 14px",
        fontSize: "0.8125rem",
        minHeight: "34px",
        borderRadius: 999,
        boxShadow: "none",
      },
      sizeSmall: {
        padding: "4px 10px",
        fontSize: "0.75rem",
        minHeight: "28px",
      },
      contained: {
        fontWeight: 700,
      },
      outlined: {
        borderWidth: 1,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      standardInfo: {
        border: "1px solid rgba(47, 125, 50, 0.24)",
      },
      filledInfo: {
        fontWeight: 600,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      size: "small",
    },
    styleOverrides: {
      root: {
        "& .MuiInputBase-root": {
          fontSize: "0.8125rem",
          borderRadius: 8,
        },
        "& .MuiInputLabel-root": {
          fontSize: "0.8125rem",
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: "8px",
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: "8px",
        "&:last-child": {
          paddingBottom: "8px",
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontSize: "0.6875rem",
        height: "24px",
        borderRadius: 999,
      },
      sizeSmall: {
        fontSize: "0.625rem",
        height: "20px",
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: "12px",
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        fontSize: "0.8125rem",
        padding: "10px 12px",
      },
      head: {
        fontWeight: 700,
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        padding: "6px",
      },
      sizeSmall: {
        padding: "4px",
      },
    },
  },
};

export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
    primary: {
      main: "#1f6a3a",
      light: "#4d9761",
      dark: "#124728",
      contrastText: "#f7f1e3",
    },
    secondary: {
      main: "#8c6a36",
      light: "#c7a873",
      dark: "#63481f",
      contrastText: "#fff8ec",
    },
    error: {
      main: "#b8404a",
      light: "#e39a99",
      dark: "#84222c",
      contrastText: "#fff9f8",
    },
    warning: {
      main: "#c78320",
      light: "#edc276",
      dark: "#8d5610",
      contrastText: "#1f1708",
    },
    info: {
      main: "#3e7f46",
      light: "#8cc791",
      dark: "#25552b",
      contrastText: "#f7fff6",
    },
    success: {
      main: "#2f7d32",
      light: "#81bf84",
      dark: "#1d4f20",
      contrastText: "#f7fff6",
    },
    background: {
      default: "#eef3ea",
      paper: "#f8f4ea",
    },
    text: {
      primary: "#173021",
      secondary: "#526356",
    },
    divider: "rgba(31, 106, 58, 0.14)",
  },
  typography: {
    fontSize: 12,
    fontFamily: BODY_FONT_FAMILY,
    h1: { fontSize: "1.9rem", fontWeight: 700, lineHeight: 1.15, fontFamily: HEADING_FONT_FAMILY },
    h2: { fontSize: "1.65rem", fontWeight: 700, lineHeight: 1.15, fontFamily: HEADING_FONT_FAMILY },
    h3: { fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.2, fontFamily: HEADING_FONT_FAMILY },
    h4: { fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.25, fontFamily: HEADING_FONT_FAMILY },
    h5: { fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.3, fontFamily: HEADING_FONT_FAMILY },
    h6: { fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3, fontFamily: HEADING_FONT_FAMILY },
    body1: { fontSize: "0.9rem", lineHeight: 1.45, fontFamily: BODY_FONT_FAMILY },
    body2: { fontSize: "0.8rem", lineHeight: 1.45, fontFamily: BODY_FONT_FAMILY },
    button: { fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.01em", textTransform: "none" },
    caption: { fontSize: "0.7rem", lineHeight: 1.35, fontFamily: BODY_FONT_FAMILY },
    subtitle1: { fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.4, fontFamily: BODY_FONT_FAMILY },
    subtitle2: { fontSize: "0.8125rem", fontWeight: 600, lineHeight: 1.4, fontFamily: BODY_FONT_FAMILY },
    overline: { fontFamily: BODY_FONT_FAMILY, fontWeight: 700, letterSpacing: "0.18em" },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 6,
  components: {
    ...sharedComponents,
    MuiButton: {
      styleOverrides: {
        ...sharedComponents?.MuiButton?.styleOverrides,
        text: {
          color: "#1f6a3a",
        },
        textPrimary: {
          color: "#1f6a3a",
        },
        outlined: {
          borderColor: "rgba(31, 106, 58, 0.28)",
          color: "#1f6a3a",
        },
        outlinedPrimary: {
          borderColor: "rgba(31, 106, 58, 0.32)",
          color: "#1f6a3a",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        ...sharedComponents?.MuiAlert?.styleOverrides,
        standardInfo: {
          border: "1px solid rgba(47, 125, 50, 0.24)",
          backgroundColor: "rgba(129, 191, 132, 0.12)",
          color: "#173021",
        },
        icon: {
          color: "#2f7d32",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        ...sharedComponents?.MuiIconButton?.styleOverrides,
        colorPrimary: {
          color: "#1f6a3a",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(circle at top, rgba(112, 161, 112, 0.18), transparent 24%), linear-gradient(180deg, #f4f7ef 0%, #e9f0e4 42%, #eef3ea 100%)",
        },
      },
    },
  },
};

export const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#7bbb72",
      light: "#a2d297",
      dark: "#3b6b39",
      contrastText: "#0d150f",
    },
    secondary: {
      main: "#d8bf8d",
      light: "#e8d7b6",
      dark: "#a78855",
      contrastText: "#20170b",
    },
    error: {
      main: "#de7f84",
      light: "#f1b0af",
      dark: "#9e434d",
      contrastText: "#1f0f10",
    },
    warning: {
      main: "#d8aa57",
      light: "#ebcc8f",
      dark: "#986d28",
      contrastText: "#1d1408",
    },
    info: {
      main: "#94ce8d",
      light: "#bee3b8",
      dark: "#54804e",
      contrastText: "#0d140d",
    },
    success: {
      main: "#86cf8a",
      light: "#b2e1b5",
      dark: "#4a8b4f",
      contrastText: "#0d140d",
    },
    background: {
      default: "#0f1b14",
      paper: "#13231a",
    },
    text: {
      primary: "#edf3e8",
      secondary: "#bfd0c0",
    },
    divider: "rgba(135, 186, 120, 0.16)",
  },
  typography: {
    fontSize: 12,
    fontFamily: BODY_FONT_FAMILY,
    h1: { fontSize: "1.9rem", fontWeight: 700, lineHeight: 1.15, fontFamily: HEADING_FONT_FAMILY },
    h2: { fontSize: "1.65rem", fontWeight: 700, lineHeight: 1.15, fontFamily: HEADING_FONT_FAMILY },
    h3: { fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.2, fontFamily: HEADING_FONT_FAMILY },
    h4: { fontSize: "1.2rem", fontWeight: 700, lineHeight: 1.25, fontFamily: HEADING_FONT_FAMILY },
    h5: { fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.3, fontFamily: HEADING_FONT_FAMILY },
    h6: { fontSize: "0.95rem", fontWeight: 700, lineHeight: 1.3, fontFamily: HEADING_FONT_FAMILY },
    body1: { fontSize: "0.9rem", lineHeight: 1.45, fontFamily: BODY_FONT_FAMILY },
    body2: { fontSize: "0.8rem", lineHeight: 1.45, fontFamily: BODY_FONT_FAMILY },
    button: { fontSize: "0.8125rem", fontWeight: 600, letterSpacing: "0.01em", textTransform: "none" },
    caption: { fontSize: "0.7rem", lineHeight: 1.35, fontFamily: BODY_FONT_FAMILY },
    subtitle1: { fontSize: "0.9rem", fontWeight: 600, lineHeight: 1.4, fontFamily: BODY_FONT_FAMILY },
    subtitle2: { fontSize: "0.8125rem", fontWeight: 600, lineHeight: 1.4, fontFamily: BODY_FONT_FAMILY },
    overline: { fontFamily: BODY_FONT_FAMILY, fontWeight: 700, letterSpacing: "0.18em" },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 6,
  components: {
    ...sharedComponents,
    MuiButton: {
      styleOverrides: {
        ...sharedComponents?.MuiButton?.styleOverrides,
        text: {
          color: "#94ce8d",
        },
        textPrimary: {
          color: "#94ce8d",
        },
        outlined: {
          borderColor: "rgba(148, 206, 141, 0.3)",
          color: "#94ce8d",
        },
        outlinedPrimary: {
          borderColor: "rgba(148, 206, 141, 0.36)",
          color: "#94ce8d",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        ...sharedComponents?.MuiAlert?.styleOverrides,
        standardInfo: {
          border: "1px solid rgba(148, 206, 141, 0.3)",
          backgroundColor: "rgba(134, 207, 138, 0.12)",
          color: "#edf3e8",
        },
        icon: {
          color: "#94ce8d",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        ...sharedComponents?.MuiIconButton?.styleOverrides,
        colorPrimary: {
          color: "#94ce8d",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(circle at top, rgba(123, 187, 114, 0.12), transparent 25%), linear-gradient(180deg, #122017 0%, #0f1b14 48%, #14241a 100%)",
        },
      },
    },
  },
};
