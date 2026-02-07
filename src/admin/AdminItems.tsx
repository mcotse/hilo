import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Fact {
  _id: Id<"facts">;
  itemId: Id<"items">;
  metricKey: string;
  value: number;
  unit: string;
  source: string;
  sourceUrl?: string;
  asOf: string;
  status: "verified" | "unverified" | "disputed";
  createdAt: number;
  updatedAt: number;
}

interface ItemWithFacts {
  _id: Id<"items">;
  name: string;
  slug: string;
  emoji: string;
  tags: string[];
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
  facts: Fact[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const statusColors: Record<string, string> = {
  verified: "text-green-400",
  unverified: "text-yellow-400",
  disputed: "text-red-400",
};

const statusDots: Record<string, string> = {
  verified: "bg-green-400",
  unverified: "bg-yellow-400",
  disputed: "bg-red-400",
};

function getVerificationStatus(facts: Fact[]): string {
  if (facts.length === 0) return "unverified";
  if (facts.every((f) => f.status === "verified")) return "verified";
  if (facts.some((f) => f.status === "disputed")) return "disputed";
  return "unverified";
}

// ---------------------------------------------------------------------------
// Add Item Form
// ---------------------------------------------------------------------------

function AddItemForm({ onClose }: { onClose: () => void }) {
  const createItem = useMutation(api.itemMutations.create);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [emoji, setEmoji] = useState("");
  const [tags, setTags] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManuallyEdited) {
      setSlug(toKebabCase(value));
    }
  }

  async function handleSubmit() {
    if (!name.trim() || !slug.trim()) return;
    setSaving(true);
    try {
      await createItem({
        name: name.trim(),
        slug: slug.trim(),
        emoji: emoji.trim() || "?",
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onClose();
    } catch (err) {
      console.error("Failed to create item:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-white/10 bg-neutral-800 p-5">
      <h3 className="text-lg font-semibold text-white mb-4">Add New Item</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. United States"
            className="w-full rounded-md bg-neutral-900 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            placeholder="auto-generated"
            className="w-full rounded-md bg-neutral-900 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Emoji</label>
          <input
            type="text"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="e.g. US flag emoji"
            className="w-full rounded-md bg-neutral-900 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g. country, north-america"
            className="w-full rounded-md bg-neutral-900 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        <button
          onClick={handleSubmit}
          disabled={saving || !name.trim() || !slug.trim()}
          className="rounded-md bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          {saving ? "Creating..." : "Create Item"}
        </button>
        <button
          onClick={onClose}
          className="rounded-md bg-neutral-700 hover:bg-neutral-600 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Expanded Row (inline editor)
// ---------------------------------------------------------------------------

function ExpandedRow({
  item,
  onCollapse,
}: {
  item: ItemWithFacts;
  onCollapse: () => void;
}) {
  const updateItem = useMutation(api.itemMutations.update);
  const updateFact = useMutation(api.itemMutations.updateFact);

  // Item editing state
  const [editName, setEditName] = useState(item.name);
  const [editEmoji, setEditEmoji] = useState(item.emoji);
  const [editTags, setEditTags] = useState(item.tags.join(", "));

  // Fact editing state: keyed by fact _id
  const [factEdits, setFactEdits] = useState<
    Record<string, { value: string; source: string; asOf: string }>
  >(() => {
    const edits: Record<string, { value: string; source: string; asOf: string }> = {};
    for (const fact of item.facts) {
      edits[fact._id] = {
        value: String(fact.value),
        source: fact.source,
        asOf: fact.asOf,
      };
    }
    return edits;
  });

  const [saving, setSaving] = useState(false);

  function updateFactField(
    factId: string,
    field: "value" | "source" | "asOf",
    val: string
  ) {
    setFactEdits((prev) => ({
      ...prev,
      [factId]: { ...prev[factId], [field]: val },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // Update item fields
      const newTags = editTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await updateItem({
        id: item._id,
        name: editName.trim(),
        emoji: editEmoji.trim(),
        tags: newTags,
      });

      // Update each fact
      for (const fact of item.facts) {
        const edit = factEdits[fact._id];
        if (!edit) continue;

        const parsedValue = parseFloat(edit.value);
        if (isNaN(parsedValue)) continue;

        // Only update if something changed
        if (
          parsedValue !== fact.value ||
          edit.source !== fact.source ||
          edit.asOf !== fact.asOf
        ) {
          await updateFact({
            id: fact._id,
            value: parsedValue,
            source: edit.source,
            asOf: edit.asOf,
          });
        }
      }

      onCollapse();
    } catch (err) {
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr>
      <td colSpan={7} className="p-0">
        <div className="bg-neutral-800 border-t border-b border-white/10 px-6 py-5">
          {/* Item fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-xs text-white/50 mb-1">Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-md bg-neutral-900 border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">Emoji</label>
              <input
                type="text"
                value={editEmoji}
                onChange={(e) => setEditEmoji(e.target.value)}
                className="w-full rounded-md bg-neutral-900 border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white/30"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full rounded-md bg-neutral-900 border border-white/10 px-3 py-1.5 text-sm text-white focus:outline-none focus:border-white/30"
              />
            </div>
          </div>

          {/* Facts table */}
          {item.facts.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white/70 mb-2">Facts</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-white/40 text-xs">
                      <th className="pb-2 pr-3">Metric</th>
                      <th className="pb-2 pr-3">Value</th>
                      <th className="pb-2 pr-3">Unit</th>
                      <th className="pb-2 pr-3">Source</th>
                      <th className="pb-2 pr-3">As Of</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.facts.map((fact) => {
                      const edit = factEdits[fact._id];
                      return (
                        <tr key={fact._id} className="border-t border-white/5">
                          <td className="py-2 pr-3 text-white/60 font-mono text-xs">
                            {fact.metricKey}
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="text"
                              value={edit?.value ?? String(fact.value)}
                              onChange={(e) =>
                                updateFactField(fact._id, "value", e.target.value)
                              }
                              className="w-28 rounded bg-neutral-900 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30"
                            />
                          </td>
                          <td className="py-2 pr-3 text-white/60 text-xs">
                            {fact.unit}
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="text"
                              value={edit?.source ?? fact.source}
                              onChange={(e) =>
                                updateFactField(fact._id, "source", e.target.value)
                              }
                              className="w-40 rounded bg-neutral-900 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="text"
                              value={edit?.asOf ?? fact.asOf}
                              onChange={(e) =>
                                updateFactField(fact._id, "asOf", e.target.value)
                              }
                              className="w-28 rounded bg-neutral-900 border border-white/10 px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30"
                            />
                          </td>
                          <td className="py-2">
                            <span
                              className={`text-xs font-medium ${statusColors[fact.status]}`}
                            >
                              {fact.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {item.facts.length === 0 && (
            <p className="text-sm text-white/40 mb-4">No facts for this item.</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-green-600 hover:bg-green-500 disabled:opacity-40 px-4 py-1.5 text-sm font-medium text-white transition-colors"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={onCollapse}
              className="rounded-md bg-neutral-700 hover:bg-neutral-600 px-4 py-1.5 text-sm font-medium text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function AdminItems() {
  const items = useQuery(api.items.listAll);
  const removeItem = useMutation(api.itemMutations.remove);

  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<Id<"items"> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<Id<"items"> | null>(null);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    if (!items) return [];
    const query = search.toLowerCase();
    const filtered = query
      ? items.filter((item) => item.name.toLowerCase().includes(query))
      : [...items];
    filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [items, search]);

  async function handleDelete(id: Id<"items">) {
    try {
      await removeItem({ id });
      setConfirmDeleteId(null);
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  }

  if (!items) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-4">Items</h1>
        <p className="text-white/60">Loading items...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Items{" "}
          <span className="text-base font-normal text-white/40">
            ({items.length})
          </span>
        </h1>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-md bg-green-600 hover:bg-green-500 px-4 py-2 text-sm font-medium text-white transition-colors"
        >
          {showAddForm ? "Close Form" : "+ Add Item"}
        </button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <AddItemForm onClose={() => setShowAddForm(false)} />
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search items by name..."
          className="w-full max-w-md rounded-md bg-neutral-900 border border-white/10 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-neutral-900/80">
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Emoji
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Name
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Slug
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Tags
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Facts
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const isExpanded = expandedId === item._id;
              const verStatus = getVerificationStatus(item.facts);

              return (
                <ItemRowGroup
                  key={item._id}
                  item={item}
                  isExpanded={isExpanded}
                  verStatus={verStatus}
                  onToggleExpand={() =>
                    setExpandedId(isExpanded ? null : item._id)
                  }
                  onConfirmDelete={() => setConfirmDeleteId(item._id)}
                  onCollapse={() => setExpandedId(null)}
                />
              );
            })}
            {filteredItems.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-white/40"
                >
                  {search
                    ? "No items match your search."
                    : "No items yet. Add one above."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-neutral-800 border border-white/10 rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Delete Item?
            </h3>
            <p className="text-sm text-white/60 mb-5">
              This will permanently delete the item and all its facts. This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-md bg-neutral-700 hover:bg-neutral-600 px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteId)}
                className="rounded-md bg-red-600 hover:bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ItemRowGroup — a row + optional expanded editor
// ---------------------------------------------------------------------------

function ItemRowGroup({
  item,
  isExpanded,
  verStatus,
  onToggleExpand,
  onConfirmDelete,
  onCollapse,
}: {
  item: ItemWithFacts;
  isExpanded: boolean;
  verStatus: string;
  onToggleExpand: () => void;
  onConfirmDelete: () => void;
  onCollapse: () => void;
}) {
  return (
    <>
      <tr
        onClick={onToggleExpand}
        className={`cursor-pointer transition-colors ${
          isExpanded
            ? "bg-neutral-800"
            : "bg-neutral-900 hover:bg-neutral-800"
        }`}
      >
        <td className="px-4 py-3 text-lg">{item.emoji}</td>
        <td className="px-4 py-3 text-white font-medium">{item.name}</td>
        <td className="px-4 py-3 text-white/50 font-mono text-xs">
          {item.slug}
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60"
              >
                {tag}
              </span>
            ))}
          </div>
        </td>
        <td className="px-4 py-3 text-white/50">{item.facts.length}</td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center gap-1.5">
            <span
              className={`inline-block h-2 w-2 rounded-full ${statusDots[verStatus]}`}
            />
            <span className={`text-xs ${statusColors[verStatus]}`}>
              {verStatus}
            </span>
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onConfirmDelete();
            }}
            className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
          >
            Delete
          </button>
        </td>
      </tr>
      {isExpanded && <ExpandedRow item={item} onCollapse={onCollapse} />}
    </>
  );
}
