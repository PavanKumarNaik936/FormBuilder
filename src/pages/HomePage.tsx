import { Box, Typography, Button, Stack } from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: 3,
        textAlign: "center",
        color: "#2e7d32",
        background: "linear-gradient(135deg, #f7fcf7 0%, #e6f4e6 100%)",
      }}
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ marginBottom: 16 }}
      >
        <Typography variant="h3" component="h1" fontWeight="bold">
          Welcome to the Dynamic Form Builder
        </Typography>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        style={{ maxWidth: 600, marginBottom: 32, color: "#4a7c4a" }}
      >
        <Typography
          variant="h6"
          color="textSecondary"
          sx={{ color: "text.secondary" }}
        >
          Create customizable forms with validations, preview your forms, and
          manage saved forms — all in one place and without any backend setup.
        </Typography>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          justifyContent="center"
          flexWrap="wrap"
        >
          {/* Animate wrapper div, normal MUI Button with component=Link */}
          <MotionDiv whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
            <Button
              component={Link}
              to="/create"
              variant="contained"
              color="success"
              size="large"
              sx={{
                px: 4,
                fontWeight: 600,
                boxShadow:
                  "0 4px 10px rgb(56 142 60 / 0.5), 0 0 15px rgb(56 142 60 / 0.3)",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor: "#2e7d32",
                  boxShadow:
                    "0 6px 14px rgb(46 125 50 / 0.7), 0 0 20px rgb(46 125 50 / 0.5)",
                },
              }}
            >
              Create New Form
            </Button>
          </MotionDiv>

          <MotionDiv whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
            <Button
              component={Link}
              to="/myforms"
              variant="outlined"
              color="success"
              size="large"
              sx={{
                px: 4,
                fontWeight: 600,
                borderColor: "#4a7c4a",
                color: "#4a7c4a",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#2e7d32",
                  color: "#2e7d32",
                  backgroundColor: "rgba(46,125,50,0.1)",
                },
              }}
            >
              View Saved Forms
            </Button>
          </MotionDiv>
        </Stack>
      </motion.div>
    </Box>
  );
}
