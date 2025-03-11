import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
} from "@mui/material";
import {
  Edit,
  Delete,
  Description,
  ExpandLess,
  ExpandMore,
  DragIndicator,
} from "@mui/icons-material";
import { AssignmentOutlined, MenuBook, Category } from "@mui/icons-material";
import axios from "axios";
import { styles } from "./PanelStyles";
import { produce } from "immer";
// dnd kit imports
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PropTypes from "prop-types";

const BASE_URL = "http://82.112.236.241:5000/api";

// A separate component for sortable items using dnd kit.
const SortableItem = ({ entity, renderEntity, depth = 0 }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: entity._id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition: transition || 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', // Smoother bezier curve
      marginBottom: "16px",
      border: "none",
      padding: "2px 10px", // Improved vertical spacing
      background: " #f9fafb", // Soft off-white background
      borderRadius: "14px", // Increased for modern aesthetic
      boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.1)", // Modern default shadow
      borderLeft: "4px solid rgb(26, 61, 234)", // Soft periwinkle accent
      '&:hover': {
        transform: "translateY(-1px)", // Subtle lift effect
        boxShadow: "0 8px 24px -4px rgba(0, 0, 0, 0.08)", // Softer, minimal shadow
        background: "linear-gradient(95deg, #f8fafc 0%, #fdf2f8 100%)", // Subtle gradient
        borderLeftColor: "#818cf8", // Medium indigo
      },
      '&:active': {
        transform: "translateY(0)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Flatter, pressed shadow
        background: "#f3f4f6", // Warm light gray
        borderLeftColor: "#c7d2fe", // Light periwinkle
      }
    };

  // Pass the combined dnd kit props (listeners & attributes) to be applied on the drag handle.
  const dragHandleProps = { ...listeners, ...attributes };

  return (
    <Box ref={setNodeRef} style={style}>
      {renderEntity(entity, dragHandleProps, depth)}
    </Box>
  );
};

SortableItem.propTypes = {
  entity: PropTypes.object.isRequired,
  renderEntity: PropTypes.func.isRequired,
  depth: PropTypes.number,
};

// Helper function to find original position
const findEntityPosition = (items, id, parentId = null) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i]._id === id) return { index: i, parentId };
    if (items[i].children) {
      const found = findEntityPosition(items[i].children, id, items[i]._id);
      if (found) return found;
    }
  }
  return null;
};

const Panel = () => {
  // State Management
  const [data, setData] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [editingEntity, setEditingEntity] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [expandedEntities, setExpandedEntities] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [editingTestName, setEditingTestName] = useState(null);
  const [newTestName, setNewTestName] = useState("");

  // Dialog and Snackbar States
  const [dialogState, setDialogState] = useState({
    delete: false,
    add: false,
  });
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    message: "",
    type: "info",
  });

  // Form States
  const [formState, setFormState] = useState({
    name: "",
    type: "",
    description: "",
    testName: "",
    videoLink: "",
  });

  // Undo State
  const [undoState, setUndoState] = useState({
    visible: false,
    counter: 5,
    position: null,
    entity: null,
    parentId: null,
  });

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/entities`);
        setData(response.data);
      } catch (error) {
        const message =
          error.response?.data?.message ||
          (error.message.includes("Network Error")
            ? "Network Error - Check Internet Connection"
            : "Server Error - Please Try Again Later");
        showSnackbar(message, "error");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle Before Unload
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (editingEntity) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [editingEntity]);

  // Helper Functions
  const showSnackbar = (message, type = "info") => {
    const formattedMessage = message.replace(/Error: /i, ""); // Remove redundant "Error" prefix
    setSnackbarState({
      open: true,
      message: formattedMessage,
      type:
        type === "error" ? "error" : type === "warning" ? "warning" : "success",
    });
  };

  const closeSnackbar = () => {
    setSnackbarState({ open: false, message: "", type: "info" });
  };

  const openDialog = (dialog) => {
    setDialogState((prev) => ({ ...prev, [dialog]: true }));
  };

  const closeDialog = (dialog) => {
    setDialogState((prev) => ({ ...prev, [dialog]: false }));
    setFormState({
      name: "",
      type: "",
      description: "",
      testName: "",
      videoLink: "",
    });
    setEditingEntity(null);
  };

  const validateForm = () => {
    if (!formState.name.trim()) {
      showSnackbar("Name cannot be empty", "warning");
      return false;
    }
    return true;
  };

  // CRUD Operations
  const addEntity = async () => {
    if (isAdding) return;
    setIsAdding(true);

    if (!validateForm()) {
      setIsAdding(false);
      return;
    }

    const { name, type, description, testName, videoLink } = formState;

    try {
      const response = await axios.post(`${BASE_URL}/entities`, {
        name,
        type,
        description: type === "topic" ? description : undefined,
        parentId: selectedEntity ? selectedEntity._id : null,
        testName,
        videoLink,
      });

      // In addEntity function, modify the setData callback to use recursive parent search
      setData((prevData) =>
        produce(prevData, (draft) => {
          if (selectedEntity) {
            const findParent = (items) => {
              for (const item of items) {
                if (item._id === selectedEntity._id) return item;
                if (item.children) {
                  const found = findParent(item.children);
                  if (found) return found;
                }
              }
              return null;
            };

            const parent = findParent(draft);
            if (parent) parent.children.push(response.data);
          } else {
            draft.push(response.data);
          }
        })
      );
      setSelectedEntity(null);
      showSnackbar(`Entity "${name}" added successfully`, "success");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.message.includes("Network Error")
          ? "Network Error - Check Internet Connection"
          : "Server Error - Please Try Again Later");
      showSnackbar(message, "error");
    } finally {
      setIsAdding(false);
      closeDialog("add");
    }
  };

  const deleteEntity = async () => {
    if (!selectedEntity?._id) {
      showSnackbar("No entity selected or _id is missing", "warning");
      return;
    }

    try {
      await axios.delete(`${BASE_URL}/entities/${selectedEntity._id}`);
      const removeFromHierarchy = (items) =>
        produce(items, (draft) => {
          const index = draft.findIndex(
            (item) => item._id === selectedEntity._id
          );
          if (index > -1) draft.splice(index, 1);
          draft.forEach((item) => {
            if (item.children)
              item.children = removeFromHierarchy(item.children);
          });
        });

      setData(removeFromHierarchy(data));

      setUndoState({
        visible: true,
        counter: 5,
        entity: selectedEntity,
        parentId: selectedEntity.parentId,
        position: findEntityPosition(data, selectedEntity._id), // New position tracking
      });

      setSelectedEntity(null);
      const entityName = selectedEntity?.name || "Entity";
      showSnackbar(`"${entityName}" deleted successfully`, "success");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.message.includes("Network Error")
          ? "Network Error - Check Internet Connection"
          : "Server Error - Please Try Again Later");
      showSnackbar(message, "error");
    } finally {
      closeDialog("delete");
    }
  };

  const updateEntity = useCallback(
    async (entity) => {
      if (!editingName) {
        showSnackbar("Name cannot be empty", "warning");
        return;
      }

      try {
        const response = await axios.put(`${BASE_URL}/entities/${entity._id}`, {
          name: editingName,
        });

        const updateInHierarchy = (items) =>
          items.map((item) =>
            item._id === entity._id
              ? { ...item, ...response.data }
              : { ...item, children: updateInHierarchy(item.children) }
          );

        setData(updateInHierarchy(data));
        setSelectedEntity(null);
        showSnackbar(`Entity "${editingName}" updated successfully`, "success");
      } catch (error) {
        const message =
          error.response?.data?.message ||
          (error.message.includes("Network Error")
            ? "Network Error - Check Internet Connection"
            : "Server Error - Please Try Again Later");
        showSnackbar(message, "error");
      } finally {
        setEditingEntity(null);
        setEditingName("");
      }
    },
    [editingName, showSnackbar]
  );

  const renameTestName = async (entityId, newTestName) => {
    try {
      const response = await axios.put(`${BASE_URL}/entities/${entityId}/renameTestName`, {
        testName: newTestName,
      });

      const updateInHierarchy = (items) =>
        items.map((item) =>
          item._id === entityId
            ? { ...item, ...response.data }
            : { ...item, children: updateInHierarchy(item.children) }
        );

      setData(updateInHierarchy(data));
      showSnackbar(`Test name updated successfully to "${newTestName}"`, "success");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.message.includes("Network Error")
          ? "Network Error - Check Internet Connection"
          : "Server Error - Please Try Again Later");
      showSnackbar(message, "error");
    }
  };

  const undoDelete = async () => {
    if (!undoState.entity) return;

    try {
      const response = await axios.post(
        `${BASE_URL}/entities`,
        undoState.entity
      );
      let updatedData = [...data];

      if (undoState.parentId) {
        const addToParent = (items) =>
          items.map((item) =>
            item._id === undoState.parentId
              ? { ...item, children: [...(item.children || []), response.data] }
              : {
                  ...item,
                  children: item.children ? addToParent(item.children) : [],
                }
          );
        updatedData = addToParent(updatedData);
      } else {
        updatedData.push(response.data);
      }

      setData(updatedData);
      showSnackbar(
        `Undo delete successful for entity "${undoState.entity.name}"`,
        "success"
      );
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.message.includes("Network Error")
          ? "Network Error - Check Internet Connection"
          : "Server Error - Please Try Again Later");
      showSnackbar(message, "error");
    } finally {
      setUndoState({
        visible: false,
        counter: 5,
        position: null,
        entity: null,
        parentId: null,
      });
    }
  };

  useEffect(() => {
    if (!undoState.visible) return;

    const timer = setTimeout(() => {
      setUndoState((prev) => ({
        ...prev,
        counter: prev.counter > 0 ? prev.counter - 1 : 0,
      }));

      if (undoState.counter === 0) {
        setUndoState({
          visible: false,
          counter: 5,
          position: null,
          entity: null,
          parentId: null,
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [undoState.visible, undoState.counter]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const originalData = data;
    const moveItem = (items, parentId = null) => {
      const oldIndex = items.findIndex((e) => e._id === active.id);
      const newIndex = items.findIndex((e) => e._id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return items.map((item) =>
          item.children
            ? { ...item, children: moveItem(item.children, item._id) }
            : item
        );
      }

      const updatedItems = arrayMove(items, oldIndex, newIndex);
      return updatedItems.map((item, index) => ({
        ...item,
        position: index,
        children: item.children ? moveItem(item.children, item._id) : [],
      }));
    };
    setIsReordering(true);
    try {
      const updatedData = moveItem(data);
      setData(updatedData);
      await axios.post(`${BASE_URL}/entities/reorder`, { updatedData });
      showSnackbar("Entities reordered successfully", "success");
    } catch (error) {
      setData(originalData);
      const message =
        error.response?.data?.message ||
        (error.message.includes("Network Error")
          ? "Network Error - Check Internet Connection"
          : "Server Error - Please Try Again Later");
      showSnackbar(message, "error");
    } finally {
      setIsReordering(false);
    }
  };

  // Event Handlers
  const handleAddClick = (type) => {
    setFormState((prev) => ({ ...prev, type }));
    openDialog("add");
  };

  const handleEditClick = useCallback((entity) => {
    setEditingEntity(entity);
    setEditingName(entity.name);
  }, []);

  const handleToggleExpand = useCallback((entity) => {
    setExpandedEntities((prev) => {
      const newSet = new Set(prev);
      newSet.has(entity._id)
        ? newSet.delete(entity._id)
        : newSet.add(entity._id);
      return newSet;
    });
  }, []);

  const handleTestNameDoubleClick = (entity) => {
    setEditingTestName(entity._id);
    setNewTestName(entity.testName);
  };

  const handleTestNameBlur = (entity) => {
    if (newTestName.trim() && newTestName !== entity.testName) {
      renameTestName(entity._id, newTestName);
    }
    setEditingTestName(null);
  };

  // Wrap these handlers in useCallback to prevent unnecessary re-renders
  const handleEntityClick = useCallback((entity) => {
    setSelectedEntity((prev) => (prev === entity ? null : entity));
  }, []);

  // Memoized Values for Add Buttons
  const entityButtons = useMemo(() => {
    if (!selectedEntity) {
      return [{ type: "exam", label: "Add Exam" }];
    }

    const buttons = [];
    if (selectedEntity.type === "exam") {
      buttons.push({ type: "subject", label: "Add Subject" });
    }
    if (selectedEntity.type === "exam" || selectedEntity.type === "subject") {
      buttons.push({ type: "topic", label: "Add Topic" });
    }
    if (
      selectedEntity.type === "exam" ||
      selectedEntity.type === "subject" ||
      selectedEntity.type === "topic"
    ) {
      buttons.push({ type: "paper", label: "Add Paper" });
    }

    return buttons;
  }, [selectedEntity]);

  // Render Entity with dragHandleProps for the drag handle
  const renderEntity = useCallback(
    (entity, dragHandleProps = {}, depth = 0) => {
      const isExpanded = expandedEntities.has(entity._id);
      const iconMap = {
        exam: <AssignmentOutlined sx={{ color: "#E65100", fontSize: 32 }} />, // Deep Purple
        subject: <MenuBook sx={{ color: "#6A1B9A", fontSize: 30 }} />, // Deep Teal
        topic: <Category sx={{ color: "#00796B", fontSize: 28 }} />, // Deep Orange
        paper: <Description sx={{ color: "#1E88E5", fontSize: 26 }} />, // Bright Blue
      };

      return (
        <Box key={`${entity._id}-${depth}`} sx={styles.entityBox(depth)}>
          {" "}
          <Box sx={styles.entityInnerBox}>
            <Box sx={styles.entityHeader}>
              {/* Drag Handle */}
              <Box
                sx={styles.dragHandle}
                {...dragHandleProps}
                role="button"
                aria-label="Drag handle"
              >
                <DragIndicator fontSize="small" />
              </Box>

              <Typography
                variant={
                  entity.type === "exam"
                    ? "h5"
                    : entity.type === "subject"
                    ? "h6"
                    : "body2"
                }
                component="div"
                sx={styles.entityTypography(entity, selectedEntity)}
                onClick={() => handleEntityClick(entity)}
                aria-label={`Select ${entity.name}`}
              >
                {iconMap[entity.type]}
                {editingEntity === entity ? (
                  <TextField
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => updateEntity(entity)}
                    onKeyDown={(e) => e.key === "Enter" && updateEntity(entity)}
                    autoFocus
                    sx={{ ml: 1 }}
                    aria-label={`Edit ${entity.name}`}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", fontSize: "0.9rem", ml: 1 }}
                    aria-label={`${entity.type} named ${entity.name}`}
                  >
                    {entity.name}
                  </Typography>
                )}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                ({entity.type})
              </Typography>
              {entity.children?.length > 0 && (
                <IconButton
                  onClick={() => handleToggleExpand(entity)}
                  size="small"
                  sx={{ ml: 1 }}
                  aria-label="Toggle Expand"
                >
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              )}
              {selectedEntity === entity && (
                <Box sx={{ ml: 2, display: "flex", gap: 1 }}>
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => handleEditClick(entity)}
                      color="primary"
                      aria-label="Edit"
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => openDialog("delete")}
                      color="secondary"
                      aria-label="Delete"
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
            {entity.type === "topic" && entity.description && (
              <Box sx={styles.entityDescription}>
                <Typography variant="body2" color="textSecondary">
                  <strong>Topic Description -</strong> {entity.description}
                </Typography>
              </Box>
            )}
            {entity.type === "paper" && (
              <Box sx={styles.entityDescription}>
                {editingTestName === entity._id ? (
                  <TextField
                    value={newTestName}
                    onChange={(e) => setNewTestName(e.target.value)}
                    onBlur={() => handleTestNameBlur(entity)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleTestNameBlur(entity)
                    }
                    autoFocus
                    fullWidth
                    aria-label={`Edit test name for ${entity.name}`}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    onDoubleClick={() => handleTestNameDoubleClick(entity)}
                    aria-label={`Test name for ${entity.name}`}
                  >
                    <strong>Test Name -</strong> {entity.testName}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
          {isExpanded && entity.children?.length > 0 && (
            <Box sx={{ ml: 3 }}>
              <SortableContext
                items={entity.children.map((child) => child._id)}
                strategy={verticalListSortingStrategy}
              >
                {entity.children.map((child) => (
                  <SortableItem
                    key={child._id}
                    entity={child}
                    renderEntity={renderEntity}
                    depth={depth + 1}
                  />
                ))}
              </SortableContext>
            </Box>
          )}
        </Box>
      );
    },
    [
      expandedEntities,
      selectedEntity,
      editingEntity,
      editingName,
      editingTestName,
      newTestName,
      handleEntityClick,
      handleEditClick,
      handleTestNameDoubleClick,
      handleTestNameBlur,
      updateEntity,
    ]
  );

  const handleKeyPress = (event, action) => {
    if (event.key === "Enter") {
      action();
    }
  };

  // Loading State
  if (loading) {
    return (
      <Container sx={styles.loadingContainer}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      disable={isAdding || isReordering}
    >
      <Container sx={styles.container}>
        <Typography variant="h1" align="center" sx={styles.title}>
          Panel
        </Typography>
        {isReordering && (
          <Box sx={styles.fullScreenOverlay}>
            <CircularProgress />
          </Box>
        )}
        <SortableContext
          items={data.map((entity) => entity._id)}
          strategy={verticalListSortingStrategy}
        >
          {data.map((entity) => (
            <SortableItem
              key={entity._id}
              entity={entity}
              renderEntity={renderEntity}
            />
          ))}
        </SortableContext>
        <Box sx={styles.fixedButtonContainer}>
          {entityButtons.map((button) => (
            <Button
              key={button.type}
              variant="contained"
              color="primary"
              onClick={() => handleAddClick(button.type)}
              onKeyPress={(e) =>
                handleKeyPress(e, () => handleAddClick(button.type))
              }
              sx={{ mr: 1 }}
              aria-label={button.label}
            >
              {button.label}
            </Button>
          ))}
        </Box>
        {undoState.visible && (
  <Box sx={styles.undoBox(undoState.position)}>
    <Typography variant="body2" align="center">
      Entity Deleted. Undo in {undoState.counter}s
    </Typography>
    <Button
      variant="contained"
      color="secondary"
      onClick={undoDelete}
      aria-label="Undo Delete"
      onKeyPress={(e) => handleKeyPress(e, undoDelete)}
    >
      Undo
    </Button>
  </Box>
)}
      </Container>
      <Dialog open={dialogState.delete} onClose={() => closeDialog("delete")}>
        <DialogTitle>Are you sure you want to delete this entity?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => closeDialog("delete")}
            color="primary"
            aria-label="Cancel Delete"
            onKeyPress={(e) => handleKeyPress(e, () => closeDialog("delete"))}
          >
            Cancel
          </Button>
          <Button
            onClick={deleteEntity}
            color="secondary"
            aria-label="Confirm Delete"
            onKeyPress={(e) => handleKeyPress(e, deleteEntity)}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={dialogState.add} onClose={() => closeDialog("add")}>
        <DialogTitle>Add New {formState.type}</DialogTitle>
        <DialogContent>
          {(formState.type === "exam" || formState.type === "subject") && (
            <TextField
              label="Name"
              inputProps={{ "aria-label": `Enter ${formState.type} name` }}
              value={formState.name}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, name: e.target.value }))
              }
              fullWidth
              sx={{ mb: 2 }}
            />
          )}
          {formState.type === "topic" && (
            <>
              <TextField
                label="Name"
                inputProps={{ "aria-label": `Enter ${formState.type} name` }}
                value={formState.name}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, name: e.target.value }))
                }
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Description"
                value={formState.description}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                multiline
                rows={3}
                fullWidth
                sx={{ mb: 2 }}
              />
            </>
          )}
          {formState.type === "paper" && (
            <>
              <TextField
                label="Paper Id"
                value={formState.name}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, name: e.target.value }))
                }
                multiline
                rows={3}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Enter Test Name"
                value={formState.testName}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    testName: e.target.value,
                  }))
                }
                multiline
                rows={3}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Enter Video Link"
                value={formState.videoLink}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    videoLink: e.target.value,
                  }))
                }
                multiline
                rows={3}
                fullWidth
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => closeDialog("add")}
            onKeyPress={(e) => handleKeyPress(e, () => closeDialog("add"))}
          >
            Cancel
          </Button>
          <Button
            onClick={addEntity}
            variant="contained"
            color="primary"
            onKeyPress={(e) => handleKeyPress(e, addEntity)}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbarState.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          severity={snackbarState.type}
          variant="filled"
          onClose={closeSnackbar}
        >
          {snackbarState.message}
        </Alert>
      </Snackbar>
    </DndContext>
  );
};

export default Panel;
