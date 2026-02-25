import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Eye,
  Layers3,
  Loader2,
  PlayCircle,
  Search,
  Video,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DisableCopy from "../../Disable/DisableCopy";

const API_URL = import.meta.env.VITE_API_URL || "https://api.freepare.com";

const typeMeta = {
  subject: { label: "Subject", icon: Layers3, color: "text-violet-600" },
  topic: { label: "Topic", icon: BookOpen, color: "text-sky-600" },
  paper: { label: "Paper", icon: Eye, color: "text-emerald-600" },
  default: { label: "Content", icon: BookOpen, color: "text-slate-600" },
};

// Helpers to compute totals/completed counts from an entity tree.
const countTotalTests = (entity) => {
  if (!entity) return 0;
  const children = Array.isArray(entity.children) ? entity.children : [];
  if (children.length === 0) {
    return 1; // treat leaf as a single test
  }
  return children.reduce((sum, child) => sum + countTotalTests(child), 0);
};

const countCompletedTests = (entity, completedIds = []) => {
  if (!entity) return 0;
  const children = Array.isArray(entity.children) ? entity.children : [];
  if (children.length === 0) {
    const id = entity._id || entity.name || "";
    return completedIds.includes(id) ? 1 : 0;
  }
  return children.reduce(
    (sum, child) => sum + countCompletedTests(child, completedIds),
    0,
  );
};

const countTouchedTopics = (entity, completedIds = []) => {
  if (!entity || !Array.isArray(entity.children)) return 0;
  return entity.children.reduce(
    (count, child) =>
      count + (countCompletedTests(child, completedIds) > 0 ? 1 : 0),
    0,
  );
};

// Helper to check if entity has children
const hasChildren = (entity) =>
  Array.isArray(entity.children) && entity.children.length > 0;

const EntityCard = ({ entity, onOpen, completedIds = [] }) => {
  const meta = typeMeta[entity.type] || typeMeta.default;
  const Icon = meta.icon;
  const hasChildren =
    Array.isArray(entity.children) && entity.children.length > 0;

  const totalTests = countTotalTests(entity);
  const completedTests = countCompletedTests(entity, completedIds);
  const percent = totalTests
    ? Math.round((completedTests / totalTests) * 100)
    : 0;
  const touchedTopics = countTouchedTopics(entity, completedIds);

  const openTest = (event) => {
    event.stopPropagation();
    const examId = encodeURIComponent(entity.name || entity._id || "");
    const testName = encodeURIComponent(entity.name || "Freepare Test");
    window.open(
      `/test?examId=${examId}&testName=${testName}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const openYoutube = (event) => {
    event.stopPropagation();
    if (!entity.youtubeLink) {
      return;
    }
    window.open(entity.youtubeLink, "_blank", "noopener,noreferrer");
  };

  return (
    <article
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {meta.label}
          </p>
          <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
            {entity.name}
          </h3>
        </div>
        <Icon className={`shrink-0 ${meta.color}`} size={20} />
      </div>

      {entity.description && (
        <p className="line-clamp-3 text-sm leading-6 text-slate-700">
          {entity.description}
        </p>
      )}

      {/* Show short child list only for non-topic entities
          For `subject` show only 4 children and a right-side "View more" button */}
      {hasChildren &&
        entity.type !== "topic" &&
        Array.isArray(entity.children) && (
          <div className="mt-3 mb-2">
            {entity.type === "subject" ? (
              <div className="flex items-start justify-between gap-3">
                <ul className="text-sm text-slate-600 list-disc pl-5 pr-3 flex-1">
                  {entity.children.slice(0, 4).map((c) => (
                    <li key={c._id || c.name} className="truncate">
                      {c.name}
                    </li>
                  ))}
                </ul>
                <div className="flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen();
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-100"
                  >
                    View more
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <ul className="text-sm text-slate-600 list-disc pl-5">
                {entity.children.slice(0, 5).map((c) => (
                  <li key={c._id || c.name} className="truncate">
                    {c.name}
                  </li>
                ))}
                {entity.children.length > 5 && (
                  <li className="text-xs text-slate-400">
                    +{entity.children.length - 5} more
                  </li>
                )}
              </ul>
            )}
          </div>
        )}

      <div className="mt-auto flex items-center gap-2 pt-4">
        {/* Show `Open` only for content (`default`) cards. For leaves, show `Start Test`. For other parent nodes, no primary action */}
        {entity.type === "default" ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
          >
            Open
            <ChevronRight size={14} />
          </button>
        ) : (
          !hasChildren && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openTest(e);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-[#066C98] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#045472]"
            >
              <PlayCircle size={14} />
              Start Test
            </button>
          )
        )}

        {entity.youtubeLink && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openYoutube(e);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
          >
            <Video size={14} />
            Watch Video
          </button>
        )}
      </div>

      {/* Progress bar and counts hidden for content (`default`) cards per request */}
      {entity.type !== "default" && (
        <div className="mt-4 w-full">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-600 font-medium">
              {completedTests}/{totalTests} tests
            </div>
            <div className="text-xs">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {percent}%
              </span>
            </div>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}
    </article>
  );
};

const Hierarchy = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [path, setPath] = useState([]);
  const [currentLevel, setCurrentLevel] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [completedIds, setCompletedIds] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await fetch(`${API_URL}/api/entities`);
      if (!response.ok) {
        throw new Error(`Unable to load content (${response.status}).`);
      }
      const entities = await response.json();
      setData(entities);
      setCurrentLevel(entities);
      setPath([]);
    } catch (error) {
      setErrorMessage(
        error.message || "Failed to fetch data. Please try again.",
      );
      setData([]);
      setCurrentLevel([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // fetch user progress from backend
    const fetchProgress = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tests/getCompletedTests`, {
          credentials: "include",
        });
        if (!res.ok) {
          // silently ignore and keep empty list
          return;
        }
        const body = await res.json();
        // Backend returns { completedTests: [...] }
        if (Array.isArray(body.completedTests)) {
          // Extract test IDs/names from the array
          const ids = body.completedTests.map(
            (test) => test.examId || test.name || test,
          );
          setCompletedIds(ids);
        }
      } catch (e) {
        // network error or CORS; ignore for now
      }
    };
    fetchProgress();
  }, [fetchData]);

  useEffect(() => {
    const toggleSearch = () => {
      setShowSearch((prev) => !prev);
    };
    window.addEventListener("toggleSearch", toggleSearch);
    return () => {
      window.removeEventListener("toggleSearch", toggleSearch);
    };
  }, []);

  const filteredEntities = useMemo(() => {
    if (!searchQuery.trim()) {
      return currentLevel;
    }
    const query = searchQuery.trim().toLowerCase();
    return currentLevel.filter((entity) =>
      entity.name?.toLowerCase().includes(query),
    );
  }, [currentLevel, searchQuery]);

  const isLeafLevel =
    filteredEntities.length > 0 &&
    filteredEntities.every((e) => !hasChildren(e));

  const currentEntity = path.length ? path[path.length - 1] : null;

  const handleNavigate = (entity) => {
    if (!hasChildren(entity)) {
      const examId = encodeURIComponent(entity.name || entity._id || "");
      const testName = encodeURIComponent(entity.name || "Freepare Test");
      navigate(`/test?examId=${examId}&testName=${testName}`);
      return;
    }
    setPath((prev) => [...prev, entity]);
    setCurrentLevel(entity.children);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (path.length === 0) {
      return;
    }
    const nextPath = path.slice(0, -1);
    setPath(nextPath);
    if (nextPath.length === 0) {
      setCurrentLevel(data);
    } else {
      setCurrentLevel(nextPath[nextPath.length - 1].children || []);
    }
    setSearchQuery("");
  };

  return (
    <>
      <DisableCopy />
      <section className="w-full px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          {path.length > 0 && (
            <div className="mb-5 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {path.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                )}
              </div>

              {path.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1 text-xs text-slate-500 sm:text-sm">
                  <span>Home</span>
                  {path.map((item) => (
                    <span
                      key={item._id || item.name}
                      className="inline-flex items-center gap-1"
                    >
                      <ChevronRight size={12} />
                      {item.name}
                    </span>
                  ))}
                </div>
              )}

              {showSearch && (
                <label className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <Search size={16} className="text-slate-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search current level..."
                    className="w-full border-none bg-transparent text-sm text-slate-700 outline-none"
                  />
                </label>
              )}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
              <Loader2 size={18} className="animate-spin" />
              Loading exam hierarchy...
            </div>
          )}

          {!loading && errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {errorMessage}
              <button
                type="button"
                onClick={fetchData}
                className="ml-2 underline underline-offset-2"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !errorMessage && filteredEntities.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
              No items found for this level.
            </div>
          )}

          {!loading && !errorMessage && filteredEntities.length > 0 && (
            <div
              className={`${isLeafLevel ? "grid grid-cols-1" : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"} gap-4`}
            >
              {filteredEntities.map((entity) => (
                <EntityCard
                  key={entity._id || entity.name}
                  entity={entity}
                  onOpen={() => handleNavigate(entity)}
                  completedIds={completedIds}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Hierarchy;
