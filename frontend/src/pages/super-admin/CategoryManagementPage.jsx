import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  FolderTree, Layers, Tag, Plus, Pencil, Trash2,
  RefreshCw, X, Check, ChevronRight, ArrowLeft,
} from "lucide-react";

import { categoriesService, subcategoriesService, eventTypesService } from "@/api";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/shared/common";

// ─── Delete dialog ─────────────────────────────────────────────────────────
const DeleteDialog = ({ open, item, onConfirm, onCancel, loading }) => (
  <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Delete "{item?.name}"?</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        This is a soft delete — the entry will be deactivated immediately.
      </p>
      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        <Button variant="destructive" onClick={onConfirm} disabled={loading}>
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Delete"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

// ─── Create / Edit dialog ──────────────────────────────────────────────────
const ItemDialog = ({
  open, item, onClose, onSave, loading, mode,
  // context passed in from current drill-down state
  parentCategory, parentSubcategory, categories, subcategories,
}) => {
  const isEdit = !!item?.slug;
  const emptyForm = { name: "", description: "", categoryId: "", subcategoryId: "", icon: "" };
  const [form, setForm] = useState(emptyForm);

  // Subcategories filtered by selected category (for event-type creation)
  const filteredSubs = useMemo(() =>
    subcategories.filter((s) => {
      const catId = typeof s.category === "object" ? s.category?._id : s.category;
      return catId === form.categoryId;
    }),
    [subcategories, form.categoryId]
  );

  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setForm({
        name:          item.name || "",
        description:   item.description || "",
        categoryId:    item.category?._id || item.category || parentCategory?._id || "",
        subcategoryId: item.subcategory?._id || item.subcategory || parentSubcategory?._id || "",
        icon:          item.icon || "",
      });
    } else {
      setForm({
        ...emptyForm,
        categoryId:    parentCategory?._id    || "",
        subcategoryId: parentSubcategory?._id || "",
      });
    }
  }, [open, item]);

  const set = (k, v) => setForm((f) => ({
    ...f, [k]: v,
    // reset subcategory when category changes
    ...(k === "categoryId" ? { subcategoryId: "" } : {}),
  }));

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (mode === "subcategory" && !form.categoryId) { toast.error("Category is required"); return; }
    if (mode === "eventType" && (!form.categoryId || !form.subcategoryId)) {
      toast.error("Category and Sub-Category are required"); return;
    }
    const payload = {
      name: form.name.trim(),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
    };
    if (mode === "subcategory") payload.category = form.categoryId;
    if (mode === "eventType") {
      payload.subcategory = form.subcategoryId;
      payload.category    = form.categoryId;
      if (form.icon.trim()) payload.icon = form.icon.trim();
    }
    onSave(payload);
  };

  const titles = { category: "Category", subcategory: "Sub-Category", eventType: "Event Type" };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit" : "Create"} {titles[mode]}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name *</label>
            <Input
              placeholder="e.g. Music, Concert Night…"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          {/* Subcategory → pick parent category */}
          {mode === "subcategory" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Parent Category *</label>
              <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                <SelectTrigger><SelectValue placeholder="Select category…" /></SelectTrigger>
                <SelectContent>
                  {categories.filter((c) => c.isActive).map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* EventType → pick category then subcategory */}
          {mode === "eventType" && (
            <>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Category *</label>
                <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                  <SelectTrigger><SelectValue placeholder="Select category…" /></SelectTrigger>
                  <SelectContent>
                    {categories.filter((c) => c.isActive).map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Sub-Category *</label>
                <Select
                  value={form.subcategoryId}
                  onValueChange={(v) => set("subcategoryId", v)}
                  disabled={!form.categoryId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={form.categoryId ? "Select sub-category…" : "Select a category first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSubs.filter((s) => s.isActive).map((sub) => (
                      <SelectItem key={sub._id} value={sub._id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Icon (optional)</label>
                <Input
                  placeholder="e.g. 🎵 or mic or music-note"
                  value={form.icon}
                  onChange={(e) => set("icon", e.target.value)}
                />
              </div>
            </>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Optional description…"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
            {isEdit ? "Save Changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Row component ─────────────────────────────────────────────────────────
const ItemRow = ({ item, onDrillDown, onEdit, onDelete, showArrow }) => (
  <div className="flex items-center justify-between py-3 px-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors group">
    <button
      className="flex items-center gap-3 min-w-0 flex-1 text-left"
      onClick={showArrow ? onDrillDown : undefined}
      disabled={!showArrow}
    >
      <div className="min-w-0">
        <p className="font-medium text-sm truncate">{item.name}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate max-w-xs">{item.description}</p>
        )}
        {item.icon && (
          <p className="text-xs text-muted-foreground">Icon: {item.icon}</p>
        )}
      </div>
    </button>
    <div className="flex items-center gap-2 ml-3 shrink-0">
      <Badge variant={item.isActive ? "default" : "secondary"} className="text-xs">
        {item.isActive ? "Active" : "Inactive"}
      </Badge>
      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(item)}>
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(item)}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      {showArrow && (
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      )}
    </div>
  </div>
);

// ─── Breadcrumb ────────────────────────────────────────────────────────────
const Breadcrumb = ({ items }) => (
  <div className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
        {item.onClick ? (
          <button onClick={item.onClick} className="hover:text-foreground transition-colors font-medium">
            {item.label}
          </button>
        ) : (
          <span className="text-foreground font-semibold">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────
const CategoryManagementPage = () => {
  const [categories,    setCategories]    = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [eventTypes,    setEventTypes]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);

  // Drill-down state: null = top level, object = drilled into that item
  const [selectedCategory,    setSelectedCategory]    = useState(null); // at category level → see subs
  const [selectedSubcategory, setSelectedSubcategory] = useState(null); // at sub level → see event types

  // Dialog state
  const [editItem,   setEditItem]   = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [search, setSearch] = useState("");

  // ── Current level ─────────────────────────────────────────────────────
  const level = selectedSubcategory ? "eventType" : selectedCategory ? "subcategory" : "category";

  // ── Fetch all data ─────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, subs, types] = await Promise.all([
        categoriesService.getAllAdmin(),
        subcategoriesService.getAllAdmin(),
        eventTypesService.getAllAdmin(),
      ]);
      setCategories(cats || []);
      setSubcategories(subs || []);
      setEventTypes(types || []);
    } catch (err) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filtered items for current level ──────────────────────────────────
  const currentItems = useMemo(() => {
    const q = search.toLowerCase();
    if (level === "category") {
      return categories.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (level === "subcategory") {
      return subcategories.filter((s) => {
        const catId = typeof s.category === "object" ? s.category?._id : s.category;
        return catId === selectedCategory._id && s.name.toLowerCase().includes(q);
      });
    }
    // eventType
    return eventTypes.filter((e) => {
      const subId = typeof e.subcategory === "object" ? e.subcategory?._id : e.subcategory;
      return subId === selectedSubcategory._id && e.name.toLowerCase().includes(q);
    });
  }, [level, categories, subcategories, eventTypes, selectedCategory, selectedSubcategory, search]);

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = [
    { label: "Categories",    value: categories.length,    icon: FolderTree, color: "text-blue-500",    bg: "bg-blue-500/10" },
    { label: "Sub-Categories", value: subcategories.length, icon: Layers,     color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Event Types",   value: eventTypes.length,    icon: Tag,         color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────
  const openCreate = () => { setEditItem(null); setDialogOpen(true); };
  const openEdit   = (item) => { setEditItem(item); setDialogOpen(true); };
  const openDelete = (item) => { setDeleteItem(item); setDeleteOpen(true); };

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      if (editItem?.slug) {
        if (level === "category")    await categoriesService.update(editItem.slug, payload);
        if (level === "subcategory") await subcategoriesService.update(editItem.slug, payload);
        if (level === "eventType")   await eventTypesService.update(editItem.slug, payload);
        toast.success("Updated successfully");
      } else {
        if (level === "category")    await categoriesService.create(payload);
        if (level === "subcategory") await subcategoriesService.create(payload);
        if (level === "eventType")   await eventTypesService.create(payload);
        toast.success("Created successfully");
      }
      setDialogOpen(false);
      await fetchAll();
    } catch (err) {
      toast.error(err.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setSaving(true);
    try {
      if (level === "category")    await categoriesService.remove(deleteItem.slug);
      if (level === "subcategory") await subcategoriesService.remove(deleteItem.slug);
      if (level === "eventType")   await eventTypesService.remove(deleteItem.slug);
      toast.success("Deleted successfully");
      setDeleteOpen(false);
      await fetchAll();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  // ── Navigation ─────────────────────────────────────────────────────────
  const goToRoot = () => { setSelectedCategory(null); setSelectedSubcategory(null); setSearch(""); };
  const goToCategory = (cat) => { setSelectedCategory(cat); setSelectedSubcategory(null); setSearch(""); };
  const goToSubcategory = (sub) => { setSelectedSubcategory(sub); setSearch(""); };
  const goBack = () => {
    if (selectedSubcategory) { setSelectedSubcategory(null); setSearch(""); }
    else { setSelectedCategory(null); setSearch(""); }
  };

  // ── Breadcrumb items ───────────────────────────────────────────────────
  const breadcrumbItems = [
    { label: "All Categories", onClick: selectedCategory ? goToRoot : null },
    ...(selectedCategory
      ? [{ label: selectedCategory.name, onClick: selectedSubcategory ? () => goToCategory(selectedCategory) : null }]
      : []),
    ...(selectedSubcategory
      ? [{ label: selectedSubcategory.name, onClick: null }]
      : []),
  ];

  // ── Level labels ───────────────────────────────────────────────────────
  const levelLabel = { category: "Category", subcategory: "Sub-Category", eventType: "Event Type" }[level];
  const levelIcon  = { category: FolderTree,  subcategory: Layers,         eventType: Tag }[level];
  const LevelIcon  = levelIcon;

  // Sub-counts for each category row
  const subCountForCat = (catId) => subcategories.filter((s) => {
    const id = typeof s.category === "object" ? s.category?._id : s.category;
    return id === catId;
  }).length;

  const typeCountForSub = (subId) => eventTypes.filter((e) => {
    const id = typeof e.subcategory === "object" ? e.subcategory?._id : e.subcategory;
    return id === subId;
  }).length;

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Category Management"
        description="Manage the full taxonomy: Categories → Sub-Categories → Event Types."
        actions={
          <Button onClick={fetchAll} variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className={`p-2 rounded-lg ${s.bg} ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{loading ? "—" : s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Drill-down Panel */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1.5">
              {/* Breadcrumb */}
              <Breadcrumb items={breadcrumbItems} />
              {/* Current level header */}
              <div className="flex items-center gap-2">
                {(selectedCategory || selectedSubcategory) && (
                  <Button variant="ghost" size="icon" className="h-7 w-7 -ml-1" onClick={goBack}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                <LevelIcon className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">
                  {level === "category" && "Categories"}
                  {level === "subcategory" && `Sub-Categories in "${selectedCategory?.name}"`}
                  {level === "eventType" && `Event Types in "${selectedSubcategory?.name}"`}
                  <span className="ml-2 text-muted-foreground font-normal text-sm">
                    ({currentItems.length})
                  </span>
                </CardTitle>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input
                placeholder={`Search ${levelLabel}s…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 h-8 text-sm"
              />
              <Button onClick={openCreate} size="sm">
                <Plus className="h-4 w-4 mr-1.5" />
                Add {levelLabel}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" /> Loading…
            </div>
          ) : currentItems.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm space-y-3">
              <LevelIcon className="h-10 w-10 mx-auto opacity-20" />
              <p>
                {search
                  ? `No results for "${search}"`
                  : `No ${levelLabel}s yet.`}
              </p>
              {!search && (
                <Button size="sm" variant="outline" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-1" /> Add {levelLabel}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {currentItems.map((item) => (
                <ItemRow
                  key={item._id}
                  item={{
                    ...item,
                    // Append child count to description area
                    description: [
                      item.description,
                      level === "category" && `${subCountForCat(item._id)} sub-categor${subCountForCat(item._id) === 1 ? "y" : "ies"}`,
                      level === "subcategory" && `${typeCountForSub(item._id)} event type${typeCountForSub(item._id) === 1 ? "" : "s"}`,
                    ].filter(Boolean).join(" · "),
                  }}
                  showArrow={level !== "eventType"}
                  onDrillDown={() => {
                    if (level === "category")    goToCategory(item);
                    if (level === "subcategory") goToSubcategory(item);
                  }}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <ItemDialog
        open={dialogOpen}
        item={editItem}
        mode={level}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        loading={saving}
        parentCategory={selectedCategory}
        parentSubcategory={selectedSubcategory}
        categories={categories}
        subcategories={subcategories}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={deleteOpen}
        item={deleteItem}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={saving}
      />
    </div>
  );
};

export default CategoryManagementPage;
