import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

interface GolfPageProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
}

interface GolfSectionProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export const GolfPage = ({ title, subtitle, eyebrow, actions, children }: GolfPageProps) => {
  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 3, md: 4 },
        position: "relative",
      }}
    >
      <Stack spacing={3.5}>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 1.5,
            px: { xs: 2.5, md: 4 },
            py: { xs: 3, md: 4 },
            border: (theme) => `1px solid ${theme.palette.divider}`,
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(24, 48, 34, 0.95), rgba(18, 39, 27, 0.92) 56%, rgba(57, 90, 49, 0.82) 100%)"
                : "linear-gradient(135deg, rgba(248, 244, 234, 0.98), rgba(241, 248, 237, 0.95) 52%, rgba(201, 223, 179, 0.92) 100%)",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 20px 50px rgba(0, 0, 0, 0.28)"
                : "0 24px 60px rgba(43, 74, 40, 0.12)",
            "&::before": {
              content: '""',
              position: "absolute",
              inset: "auto -10% -40% auto",
              width: 280,
              height: 280,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(214, 186, 120, 0.28) 0%, rgba(214, 186, 120, 0) 72%)",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "repeating-linear-gradient(115deg, rgba(255, 255, 255, 0.02) 0 14px, rgba(0, 0, 0, 0.02) 14px 28px)",
              opacity: 0.4,
              pointerEvents: "none",
            },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "flex-end" }}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Box>
            {eyebrow ? (
              <Typography
                variant="overline"
                sx={{
                  color: "primary.main",
                  letterSpacing: "0.24em",
                }}
              >
                {eyebrow}
              </Typography>
            ) : null}
            <Typography variant="h3" sx={{ mt: 0.5, fontWeight: 700, letterSpacing: "-0.03em", maxWidth: 840 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body1" sx={{ mt: 1.25, color: "text.secondary", maxWidth: 760 }}>
                {subtitle}
              </Typography>
            ) : null}
            </Box>
            {actions ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                {actions}
              </Stack>
            ) : null}
          </Stack>
        </Box>
        {children}
      </Stack>
    </Container>
  );
};

export const GolfSection = ({ title, subtitle, action, children }: GolfSectionProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        p: 3,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(180deg, rgba(19, 35, 26, 0.96), rgba(22, 38, 29, 0.88))"
            : "linear-gradient(180deg, rgba(249, 245, 235, 0.97), rgba(255, 253, 247, 0.92))",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 14px 34px rgba(0, 0, 0, 0.18)"
            : "0 18px 34px rgba(45, 73, 43, 0.08)",
      }}
    >
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {action}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
};
