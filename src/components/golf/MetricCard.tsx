import TrendingUpOutlined from "@mui/icons-material/TrendingUpOutlined";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { SxProps, Theme } from "@mui/material/styles";

interface MetricCardProps {
  eyebrow: string;
  value: string;
  detail: string;
  sx?: SxProps<Theme>;
}

export const MetricCard = ({ eyebrow, value, detail, sx }: MetricCardProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(145deg, rgba(18, 35, 25, 0.98), rgba(67, 104, 58, 0.3))"
            : "linear-gradient(145deg, rgba(252, 247, 236, 0.98), rgba(196, 220, 176, 0.55))",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 16px 30px rgba(0, 0, 0, 0.18)"
            : "0 16px 36px rgba(46, 78, 36, 0.08)",
        ...sx,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.16em" }}>
            {eyebrow}
          </Typography>
          <Typography variant="h3" sx={{ mt: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            {detail}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1,
            display: "grid",
            placeItems: "center",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(135deg, rgba(216, 191, 141, 0.88), rgba(123, 187, 114, 0.92))"
                : "linear-gradient(135deg, rgba(214, 186, 120, 0.9), rgba(31, 106, 58, 0.92))",
            color: (theme) => theme.palette.mode === "dark" ? "#122017" : "#f7f1e3",
            flexShrink: 0,
          }}
        >
          <TrendingUpOutlined fontSize="small" />
        </Box>
      </Box>
    </Paper>
  );
};
