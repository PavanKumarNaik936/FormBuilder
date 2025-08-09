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
        width: "100%",          // <-- add this
        maxWidth: 650, 

        // Multi-layered box shadow with your gradient colors
        boxShadow: `
          0 0 8px 2px rgba(252, 0, 255, 0.8),    /* #fc00ff */
       
          0 0 16px 6px rgba(67, 206, 162, 0.5),  /* #43cea2 */
          0 0 20px 8px rgba(59, 134, 209, 0.5)    /* #185a9d */
        `,

        "&::before": {
          content: '""',
          position: "absolute",
          top: -0.5,
          left: -0.5,
          right: -0.5,
          bottom: -0.5,
          borderRadius: 1,
          padding: 0.3,//

          background:
            "linear-gradient(270deg,rgb(243, 71, 246),rgb(74, 220, 222), #185a9d,#fcb045)",
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
