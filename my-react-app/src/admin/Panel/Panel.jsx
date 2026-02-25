import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Plus,
  FileText,
  BookOpen,
  Tags,
  X,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://api.freepare.com";
const BASE_URL = `${API_URL}/api`;

const SortableItem = ({ entity, renderEntity, depth = 0 }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: entity._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "all 0.25s ease",
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-5">
      {renderEntity(entity, { ...attributes, ...listeners }, depth)}
    </div>
  );
};

const Panel = () => {
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

  const [dialogState, setDialogState] = useState({ delete: false, add: false });
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  const [formState, setFormState] = useState({
    name: "",
    type: "",
    description: "",
    testName: "",
    videoLink: "",
  });

  const [undoState, setUndoState] = useState({
    visible: false,
    counter: 5,
    entity: null,
    parentId: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/entities`);
        setData(res.data);
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          (err.message.includes("Network") ? "Network Error" : "Server Error");
        showToast(msg, "error");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast({ show: false, message: "", type: "info" }), 5000);
      return () => clearTimeout(t);
    }
  }, [toast.show]);

  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
  };

  const openDialog = (key) => setDialogState((p) => ({ ...p, [key]: true }));
  const closeDialog = (key) => {
    setDialogState((p) => ({ ...p, [key]: false }));
    setFormState({ name: "", type: "", description: "", testName: "", videoLink: "" });
    setEditingEntity(null);
  };

  const addEntity = async () => {
    if (isAdding || !formState.name.trim()) {
      if (!formState.name.trim()) showToast("Name is required", "warning");
      return;
    }
    setIsAdding(true);

    const { name, type, description, testName, videoLink } = formState;

    try {
      const res = await axios.post(`${BASE_URL}/entities`, {
        name,
        type,
        description: type === "topic" ? description : undefined,
        parentId: selectedEntity?._id || null,
        testName,
        videoLink,
      });

      setData((prev) => {
        const addRecursive = (items) => {
          return items.map((item) => {
            if (item._id === selectedEntity?._id) {
              return { ...item, children: [...(item.children || []), res.data] };
            }
            if (item.children) {
              return { ...item, children: addRecursive(item.children) };
            }
            return item;
          });
        };

        return selectedEntity ? addRecursive(prev) : [...prev, res.data];
      });

      setSelectedEntity(null);
      showToast(`"${name}" added`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add", "error");
    } finally {
      setIsAdding(false);
      closeDialog("add");
    }
  };

  const deleteEntity = async () => {
    if (!selectedEntity?._id) return;

    try {
      await axios.delete(`${BASE_URL}/entities/${selectedEntity._id}`);

      const removeRecursive = (items) =>
        items.filter((item) => {
          if (item._id === selectedEntity._id) return false;
          if (item.children) item.children = removeRecursive(item.children);
          return true;
        });

      setData(removeRecursive(data));

      setUndoState({
        visible: true,
        counter: 5,
        entity: selectedEntity,
        parentId: selectedEntity.parentId,
      });

      showToast(`"${selectedEntity.name}" deleted`, "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Delete failed", "error");
    } finally {
      closeDialog("delete");
      setSelectedEntity(null);
    }
  };

  const updateEntity = useCallback(async (entity) => {
    if (!editingName.trim()) {
      showToast("Name required", "warning");
      return;
    }

    try {
      const res = await axios.put(`${BASE_URL}/entities/${entity._id}`, { name: editingName });

      const updateRecursive = (items) =>
        items.map((item) =>
          item._id === entity._id
            ? { ...item, ...res.data }
            : { ...item, children: item.children ? updateRecursive(item.children) : [] }
        );

      setData(updateRecursive(data));
      showToast(`"${editingName}" updated`, "success");
    } catch (err) {
      showToast("Update failed", "error");
    } finally {
      setEditingEntity(null);
      setEditingName("");
    }
  }, [editingName, data]);

  const renameTestName = async (entityId, name) => {
    if (!name.trim()) return;
    try {
      const res = await axios.put(`${BASE_URL}/entities/${entityId}/renameTestName`, { testName: name });
      const updateRecursive = (items) =>
        items.map((item) =>
          item._id === entityId
            ? { ...item, ...res.data }
            : { ...item, children: item.children ? updateRecursive(item.children) : [] }
        );
      setData(updateRecursive(data));
      showToast(`Test name updated`, "success");
    } catch (err) {
      showToast("Failed to update test name", "error");
    }
  };

  const addVideoLink = async (entityId) => {
    const link = prompt("Enter video link:");
    if (!link) return;
    try {
      const res = await axios.put(`${BASE_URL}/entities/${entityId}/addVideoLink`, { videoLink: link });
      const updateRecursive = (items) =>
        items.map((item) =>
          item._id === entityId
            ? { ...item, ...res.data }
            : { ...item, children: item.children ? updateRecursive(item.children) : [] }
        );
      setData(updateRecursive(data));
      showToast("Video link added", "success");
    } catch (err) {
      showToast("Failed to add video link", "error");
    }
  };

  const undoDelete = async () => {
    if (!undoState.entity) return;
    try {
      const res = await axios.post(`${BASE_URL}/entities`, undoState.entity);
      setData((prev) => {
        if (!undoState.parentId) return [...prev, res.data];
        const addRecursive = (items) =>
          items.map((item) =>
            item._id === undoState.parentId
              ? { ...item, children: [...(item.children || []), res.data] }
              : { ...item, children: item.children ? addRecursive(item.children) : [] }
          );
        return addRecursive(prev);
      });
      showToast(`Undo successful`, "success");
    } catch (err) {
      showToast("Undo failed", "error");
    } finally {
      setUndoState({ visible: false, counter: 5, entity: null, parentId: null });
    }
  };

  useEffect(() => {
    if (!undoState.visible) return;
    const id = setInterval(() => {
      setUndoState((p) => {
        if (p.counter <= 1) {
          clearInterval(id);
          return { visible: false, counter: 5, entity: null, parentId: null };
        }
        return { ...p, counter: p.counter - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [undoState.visible]);

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldData = data;

    const moveRecursive = (items) => {
      const oldIdx = items.findIndex((i) => i._id === active.id);
      const newIdx = items.findIndex((i) => i._id === over.id);

      if (oldIdx !== -1 && newIdx !== -1) {
        const moved = arrayMove(items, oldIdx, newIdx);
        return moved.map((item, idx) => ({
          ...item,
          position: idx,
          children: item.children?.map((c) => ({ ...c, parentId: item._id })) || [],
        }));
      }

      return items.map((item) => ({
        ...item,
        children: item.children ? moveRecursive(item.children) : [],
      }));
    };

    setIsReordering(true);
    try {
      const updated = moveRecursive(data);
      setData(updated);
      await axios.post(`${BASE_URL}/entities/reorder`, { updatedData: updated });
      showToast("Reordered successfully", "success");
    } catch (err) {
      setData(oldData);
      showToast("Reorder failed", "error");
    } finally {
      setIsReordering(false);
    }
  };

  const iconMap = {
    exam: <FileText className="w-8 h-8 text-orange-600" />,
    subject: <BookOpen className="w-7 h-7 text-purple-700" />,
    topic: <Tags className="w-7 h-7 text-teal-600" />,
    paper: <FileText className="w-6 h-6 text-blue-600" />,
  };

  const renderEntity = useCallback(
    (entity, dragHandleProps = {}, depth = 0) => {
      const isExpanded = expandedEntities.has(entity._id);
      const isSelected = selectedEntity?._id === entity._id;

      return (
        <div
          className={`p-5 rounded-2xl bg-white border-l-4 transition-all duration-200 shadow-sm hover:shadow-md ${
            isSelected
              ? "border-indigo-500 bg-indigo-50/40"
              : "border-indigo-200 hover:border-indigo-400"
          }`}
          style={{ marginLeft: `${depth * 20}px` }}
        >
          <div className="flex items-center gap-3 flex-wrap">
            <div
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-700 p-1 rounded"
            >
              <GripVertical className="w-5 h-5" />
            </div>

            {iconMap[entity.type]}

            {editingEntity?._id === entity._id ? (
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => updateEntity(entity)}
                onKeyDown={(e) => e.key === "Enter" && updateEntity(entity)}
                autoFocus
                className="flex-1 px-3 py-1.5 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[200px]"
              />
            ) : (
              <button
                onClick={() => setSelectedEntity((p) => (p?._id === entity._id ? null : entity))}
                className="flex-1 text-left font-medium text-gray-900 hover:text-indigo-700"
              >
                {entity.name}
                <span className="ml-2 text-xs text-gray-500">({entity.type})</span>
              </button>
            )}

            {entity.children?.length > 0 && (
              <button
                onClick={() => {
                  const newSet = new Set(expandedEntities);
                  newSet.has(entity._id) ? newSet.delete(entity._id) : newSet.add(entity._id);
                  setExpandedEntities(newSet);
                }}
                className="p-1.5 hover:bg-gray-100 rounded-full"
              >
                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            )}

            {isSelected && (
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => {
                    setEditingEntity(entity);
                    setEditingName(entity.name);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => openDialog("delete")}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Extra info */}
          {entity.type === "topic" && entity.description && (
            <p className="mt-3 text-sm text-gray-600 pl-11">
              <strong>Description:</strong> {entity.description}
            </p>
          )}

          {entity.type === "paper" && (
            <div className="mt-3 pl-11 text-sm text-gray-600">
              {editingTestName === entity._id ? (
                <input
                  value={newTestName}
                  onChange={(e) => setNewTestName(e.target.value)}
                  onBlur={() => {
                    if (newTestName.trim() && newTestName !== entity.testName) {
                      renameTestName(entity._id, newTestName);
                    }
                    setEditingTestName(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && e.target.blur()}
                  autoFocus
                  className="px-3 py-1.5 border border-gray-300 rounded-lg w-full max-w-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <p
                  className="cursor-pointer hover:text-indigo-700"
                  onDoubleClick={() => {
                    setEditingTestName(entity._id);
                    setNewTestName(entity.testName || "");
                  }}
                >
                  <strong>Test Name:</strong> {entity.testName || "—"}
                </p>
              )}

              {entity.videoLink ? (
                <p className="mt-1">
                  <strong>Video:</strong> {entity.videoLink}
                </p>
              ) : (
                <button
                  onClick={() => addVideoLink(entity._id)}
                  className="mt-2 inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="w-4 h-4" /> Add Video Link
                </button>
              )}
            </div>
          )}

          {isExpanded && entity.children?.length > 0 && (
            <div className="mt-4">
              <SortableContext items={entity.children.map((c) => c._id)} strategy={verticalListSortingStrategy}>
                {entity.children.map((child) => (
                  <SortableItem key={child._id} entity={child} renderEntity={renderEntity} depth={depth + 1} />
                ))}
              </SortableContext>
            </div>
          )}
        </div>
      );
    },
    [expandedEntities, selectedEntity, editingEntity, editingName, editingTestName, newTestName, data]
  );

  const entityButtons = useMemo(() => {
    if (!selectedEntity) return [{ type: "exam", label: "Add Exam" }];

    const btns = [];
    if (selectedEntity.type === "exam") btns.push({ type: "subject", label: "Add Subject" });
    if (["exam", "subject"].includes(selectedEntity.type))
      btns.push({ type: "topic", label: "Add Topic" });
    if (["exam", "subject", "topic"].includes(selectedEntity.type))
      btns.push({ type: "paper", label: "Add Paper" });

    return btns;
  }, [selectedEntity]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        <p className="ml-4 text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 text-center mb-10">Admin Panel</h1>

          {isReordering && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <Loader2 className="w-12 h-12 animate-spin text-white" />
            </div>
          )}

          <SortableContext items={data.map((e) => e._id)} strategy={verticalListSortingStrategy}>
            {data.map((entity) => (
              <SortableItem key={entity._id} entity={entity} renderEntity={renderEntity} />
            ))}
          </SortableContext>

          {/* Floating action buttons */}
          <div className="fixed bottom-8 right-8 flex flex-col sm:flex-row gap-4 z-40">
            {entityButtons.map((btn) => (
              <button
                key={btn.type}
                onClick={() => {
                  setFormState((p) => ({ ...p, type: btn.type }));
                  openDialog("add");
                }}
                className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                {btn.label}
              </button>
            ))}
          </div>

          {/* Undo toast */}
          {undoState.visible && (
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-6 z-50">
              <p>
                Deleted. Undo in <strong>{undoState.counter}s</strong>
              </p>
              <button
                onClick={undoDelete}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
              >
                Undo
              </button>
            </div>
          )}

          {/* Custom Toast */}
          {toast.show && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5">
              <div
                className={`px-6 py-4 rounded-xl shadow-2xl text-white flex items-center gap-4 max-w-lg ${
                  toast.type === "error"
                    ? "bg-red-600"
                    : toast.type === "warning"
                    ? "bg-amber-600"
                    : "bg-emerald-600"
                }`}
              >
                <span className="flex-1">{toast.message}</span>
                <button onClick={() => setToast({ show: false, message: "", type: "info" })}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {dialogState.delete && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
                <h2 className="text-2xl font-semibold mb-4">Confirm Delete</h2>
                <p className="text-gray-600 mb-8">
                  Are you sure? This action cannot be undone.
                </p>
                <div className="flex gap-4 justify-end">
                  <button
                    onClick={() => closeDialog("delete")}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={deleteEntity}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Entity Modal */}
          {dialogState.add && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl">
                <h2 className="text-2xl font-semibold mb-6">
                  Add New {formState.type.charAt(0).toUpperCase() + formState.type.slice(1)}
                </h2>

                <div className="space-y-5">
                  <input
                    placeholder="Name *"
                    value={formState.name}
                    onChange={(e) => setFormState((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {formState.type === "topic" && (
                    <textarea
                      placeholder="Description"
                      value={formState.description}
                      onChange={(e) => setFormState((p) => ({ ...p, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}

                  {formState.type === "paper" && (
                    <>
                      <input
                        placeholder="Test Name"
                        value={formState.testName}
                        onChange={(e) => setFormState((p) => ({ ...p, testName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        placeholder="Video Link"
                        value={formState.videoLink}
                        onChange={(e) => setFormState((p) => ({ ...p, videoLink: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </>
                  )}
                </div>

                <div className="mt-8 flex gap-4 justify-end">
                  <button
                    onClick={() => closeDialog("add")}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addEntity}
                    disabled={isAdding}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
                  >
                    {isAdding && <Loader2 className="w-5 h-5 animate-spin" />}
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DndContext>
  );
};

export default Panel;