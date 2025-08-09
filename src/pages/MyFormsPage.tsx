import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { type RootState } from '../app/store';
import { Link } from 'react-router-dom';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { deleteForm } from '../features/formBuilder/formBuilderSlice';
import GlowingCard from '../features/formBuilder/components/GlowingCard';

export default function MyFormsPage() {
  const forms = useSelector((state: RootState) => state.formBuilder.savedForms);
  const dispatch = useDispatch();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<string | null>(null);

  const confirmDelete = (formId: string) => {
    setFormToDelete(formId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = () => {
    if (formToDelete) {
      dispatch(deleteForm(formToDelete));
    }
    setDeleteDialogOpen(false);
    setFormToDelete(null);
  };

  const handleDeleteCancelled = () => {
    setDeleteDialogOpen(false);
    setFormToDelete(null);
  };

  return (
    <Box maxWidth="900px" mx="auto" p={4}>
      {/* Page Heading with gradient text */}
      <Typography
        variant="h3"
        component="h1"
        textAlign="center"
        fontWeight="bold"
        gutterBottom
        sx={{
          background: "linear-gradient(90deg,rgb(93, 237, 98),rgb(7, 24, 6))", // green gradient theme
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: 700,
          mb: 6,
          userSelect: "none",
        }}
      >
        📄 My Forms
      </Typography>

      {forms.length === 0 ? (
        <Box
          textAlign="center"
          py={12}
          borderRadius={3}
          sx={{
            background: "linear-gradient(135deg, #a4d4a5, #2e7d32)", // lighter to dark green gradient
            color: "white",
            boxShadow: "0 10px 20px rgba(46, 125, 50, 0.5)", // green shadow
          }}
        >
          <Typography variant="h6" fontWeight="medium" sx={{ userSelect: "none" }}>
            No forms saved yet.
          </Typography>
        </Box>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
          gap={4}
        >
          {forms.map((f) => (
            <GlowingCard key={f.id}>
              <Box
                sx={{
                  backgroundColor: "white",
                  borderRadius: 2,
                  p: 4,
                  minHeight: 160,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                  transition: "box-shadow 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 20px rgba(46, 125, 50, 0.3)", // greenish glow
                  },
                }}
              >
                <Box>
                  <Typography
                    variant="h5"
                    component="h2"
                    fontWeight="700"
                    gutterBottom
                    sx={{
                      background: "linear-gradient(45deg,rgb(13, 32, 14), #60ad5e)", // green text gradient
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      userSelect: "none",
                    }}
                  >
                    {f.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ userSelect: "none" }}
                  >
                    Created on {new Date(f.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
                  <Link to={`/preview?id=${f.id}`} style={{ display: 'inline-flex' }}>
                    <IconButton
                      color="primary"
                      aria-label="preview form"
                      sx={{
                        background:
                          "linear-gradient(135deg, #2e7d32, #60ad5e)", // green button gradient
                        color: "white",
                        "&:hover": {
                          background:
                            "linear-gradient(135deg, #60ad5e, #2e7d32)",
                        },
                        boxShadow: "0 4px 8px rgba(46, 125, 50, 0.6)",
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Link>

                  <IconButton
                    color="error"
                    aria-label="delete form"
                    onClick={() => confirmDelete(f.id)}
                    sx={{
                      background:
                        "linear-gradient(135deg, #a4d4a5, #2e7d32)", // lighter green gradient for delete
                      color: "white",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #2e7d32, #a4d4a5)",
                      },
                      boxShadow: "0 4px 8px rgba(46, 125, 50, 0.6)",
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </GlowingCard>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancelled}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background:
              "linear-gradient(135deg, #2e7d32, #60ad5e, #a4d4a5)", // greenish gradient background
            color: "white",
            boxShadow: "0 10px 25px rgba(46, 125, 50, 0.8)",
          },
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: 'bold' }}>
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description" sx={{ color: 'white' }}>
            Are you sure you want to delete this form? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancelled}
            variant="outlined"
            sx={{
              color: "white",
              borderColor: "white",
              "&:hover": { borderColor: "#60ad5e", color: "#60ad5e" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirmed}
            variant="contained"
            sx={{
              background:
                "linear-gradient(135deg, #60ad5e, #2e7d32)",
              "&:hover": {
                background: "linear-gradient(135deg, #2e7d32, #60ad5e)",
              },
            }}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
