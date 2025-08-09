import { Box } from "@mui/material";

export default function GlowingCard({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 1,
        backgroundColor: "white",
        padding: 1,
        zIndex: 0,
        width: "100%",
        maxWidth: 650,

        // Multi-layered box shadow with green-themed glow
        boxShadow: `
          0 0 8px 2px rgba(46, 125, 50, 0.8),    /* #2e7d32 dark green */
          0 0 16px 6px rgba(96, 173, 94, 0.5),   /* #60ad5e lighter green */
          0 0 20px 8px rgba(164, 212, 165, 0.5)  /* #a4d4a5 pale green */
        `,

        "&::before": {
          content: '""',
          position: "absolute",
          top: -0.5,
          left: -0.5,
          right: -0.5,
          bottom: -0.5,
          borderRadius: 1,
          padding: 0.3,

          background:
            "linear-gradient(270deg,rgb(12, 56, 14),rgb(3, 43, 1),rgb(190, 230, 190),rgb(57, 123, 54))",

          backgroundSize: "400% 400%",
          animation: "glowMove 12s linear infinite",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          zIndex: -1,
        },

        "@keyframes glowMove": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "100%": {
            backgroundPosition: "400% 50%",
          },
        },
      }}
    >
      {children}
    </Box>
  );
}
