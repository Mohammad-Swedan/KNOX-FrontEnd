import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Loader2, Trash2, ChevronUp, ChevronDown, Plus, X } from "lucide-react";

export default function DataEditor({
  initialData,
  onSave,
  onCancel,
  saving = false,
}: any) {
  const [titleMain, setTitleMain] = useState(initialData.TITLE?.main || "");
  const [titleSub, setTitleSub] = useState(initialData.TITLE?.sub || "");
  const [activeSection, setActiveSection] = useState(0);

  const ObjectEntries = initialData.CATEGORIES
    ? Object.entries(initialData.CATEGORIES)
    : [];
  const [categories, setCategories] = useState<any[]>(
    ObjectEntries.map(([key, val]: any) => ({
      id: key,
      label: val.label,
      color: val.color,
      showByDefault: val.showByDefault ?? false,
    })),
  );

  const [courses, setCourses] = useState<any[]>(initialData.COURSES || []);
  // ── Ordering state ─────────────────────────────────────────
  const moveCourse = (col: number, localIdx: number, dir: number) => {
    const colCourses = courses.filter((c) => c.col === col);
    const otherCourses = courses.filter((c) => c.col !== col);

    if (dir === -1 && localIdx > 0) {
      // Move up
      const temp = colCourses[localIdx];
      colCourses[localIdx] = colCourses[localIdx - 1];
      colCourses[localIdx - 1] = temp;
    } else if (dir === 1 && localIdx < colCourses.length - 1) {
      // Move down
      const temp = colCourses[localIdx];
      colCourses[localIdx] = colCourses[localIdx + 1];
      colCourses[localIdx + 1] = temp;
    } else {
      return;
    }

    setCourses([...otherCourses, ...colCourses]);
  };

  // ── Handlers ──────────────────────────────────────────────
  const handleSave = () => {
    const newCategories: any = {};
    categories.forEach((c) => {
      newCategories[c.id] = {
        label: c.label,
        color: c.color,
        showByDefault: c.showByDefault,
      };
    });
    onSave({
      TITLE: { main: titleMain, sub: titleSub },
      CATEGORIES: newCategories,
      COURSES: courses,
    });
  };

  const addCategory = () => {
    setCategories([
      ...categories,
      {
        id: "new_cat_" + Date.now(),
        label: "تصنيف جديد",
        color: "#60A5FA",
        showByDefault: true,
      },
    ]);
  };

  const updateCategory = (idx: number, field: string, val: any) => {
    const newCats = [...categories];
    newCats[idx] = { ...newCats[idx], [field]: val };
    setCategories(newCats);
  };

  const deleteCategory = (idx: number) => {
    setCategories(categories.filter((_, i) => i !== idx));
  };

  const addCourse = (colIdx: number) => {
    setCourses([
      ...courses,
      {
        id: "C" + Date.now().toString().slice(-4),
        courseSystemId: "",
        col: colIdx,
        isMain: true,
        name: "مادة جديدة",
        nameEn: "New Course",
        cat: categories[0]?.id || "",
        credits: 3,
        prereqs: [],
        description: "",
        topics: [],
      },
    ]);
  };

  const updateCourse = (idx: number, field: string, val: any) => {
    const newCourses = [...courses];
    newCourses[idx] = { ...newCourses[idx], [field]: val };
    setCourses(newCourses);
  };

  const deleteCourse = (idx: number) => {
    setCourses(courses.filter((_, i) => i !== idx));
  };

  const cols = [...new Set(courses.map((c) => c.col))].sort((a, b) => a - b);
  if (cols.length === 0) cols.push(1);

  const getCatColor = (catId: string) => {
    const c = categories.find((cat) => cat.id === catId);
    return c ? c.color : "#94A3B8";
  };

  return (
    <div
      className="w-full h-screen bg-background text-foreground flex flex-col"
      style={{
        direction: "rtl",
        fontFamily: "'Noto Sans Arabic', sans-serif",
      }}
    >
      <style>{`
        .editor-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .editor-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .editor-scroll::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.4);
          border-radius: 4px;
          transition: background 0.2s;
        }
        .editor-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
        .section-animate {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* ─── Top Bar ────────────────────────────────────────── */}
      <div className="bg-background/90 backdrop-blur-md border-b border-border px-6 py-4 flex justify-between items-center shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg">
            ✏️
          </div>
          <div>
            <h1 className="text-lg font-bold">محرر بيانات الخطة</h1>
            <p className="text-xs text-muted-foreground">
              تعديل العناوين والتصنيفات والمواد
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            aria-label="إلغاء التعديلات"
            className="gap-2"
          >
            <X className="w-4 h-4" />
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-linear-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
            aria-label="حفظ التعديلات"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                حفظ التعديلات
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ─── Tabs Navigation ─────────────────────────────────── */}
      <div className="shrink-0 border-b border-border px-6">
        <Tabs
          value={activeSection.toString()}
          onValueChange={(v) => setActiveSection(Number(v))}
        >
          <TabsList className="bg-transparent p-0 h-auto gap-1">
            <TabsTrigger
              value="0"
              className="rounded-md border-0 bg-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              📝 العنوان
            </TabsTrigger>
            <TabsTrigger
              value="1"
              className="rounded-md border-0 bg-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              🏷️ التصنيفات
            </TabsTrigger>
            <TabsTrigger
              value="2"
              className="rounded-md border-0 bg-transparent data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
            >
              📚 المواد
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* ─── Content Area ───────────────────────────────────── */}
      <div className="editor-scroll flex-1 overflow-y-auto px-6 py-6">
        <div
          className="max-w-full"
          style={{
            maxWidth: activeSection === 2 ? "100%" : "900px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {/* ── Section 0: Title ─────────────────────────── */}
          {activeSection === 0 && (
            <div className="section-animate">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">العنوان</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title-main">العنوان الرئيسي</Label>
                      <Input
                        id="title-main"
                        value={titleMain}
                        onChange={(e) => setTitleMain(e.target.value)}
                        placeholder="ادخل العنوان الرئيسي"
                        aria-label="العنوان الرئيسي"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title-sub">العنوان الفرعي</Label>
                      <Input
                        id="title-sub"
                        value={titleSub}
                        onChange={(e) => setTitleSub(e.target.value)}
                        placeholder="ادخل العنوان الفرعي"
                        aria-label="العنوان الفرعي"
                      />
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="mt-6 p-6 bg-muted rounded-lg text-center space-y-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                      معاينة
                    </p>
                    <h3 className="text-2xl font-bold">
                      {titleMain || "العنوان الرئيسي"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {titleSub || "العنوان الفرعي"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Section 1: Categories ────────────────────── */}
          {activeSection === 1 && (
            <div className="section-animate">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>التصنيفات</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {categories.length} تصنيف متوفر
                    </p>
                  </div>
                  <Button
                    onClick={addCategory}
                    size="sm"
                    className="gap-2"
                    aria-label="إضافة تصنيف جديد"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة تصنيف
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex flex-wrap gap-4 items-start p-4 bg-muted rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      {/* Color Picker */}
                      <div className="relative shrink-0">
                        <div
                          className="w-12 h-12 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                          style={{
                            background: cat.color,
                            boxShadow: `0 0 16px ${cat.color}33`,
                          }}
                        >
                          <input
                            type="color"
                            title="لون التصنيف"
                            value={cat.color.slice(0, 7)}
                            onChange={(e) =>
                              updateCategory(idx, "color", e.target.value)
                            }
                            aria-label="لون التصنيف"
                            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                          />
                        </div>
                      </div>

                      {/* ID Input */}
                      <div className="shrink-0 w-32 space-y-1">
                        <Label className="text-xs uppercase">المعرف</Label>
                        <Input
                          value={cat.id}
                          onChange={(e) =>
                            updateCategory(idx, "id", e.target.value)
                          }
                          aria-label="معرف التصنيف"
                          className="font-mono text-xs"
                          dir="ltr"
                        />
                      </div>

                      {/* Label Input */}
                      <div className="flex-1 min-w-[200px] space-y-1">
                        <Label className="text-xs uppercase">الاسم</Label>
                        <Input
                          value={cat.label}
                          onChange={(e) =>
                            updateCategory(idx, "label", e.target.value)
                          }
                          aria-label="اسم التصنيف"
                          placeholder="أدخل اسم التصنيف"
                        />
                      </div>

                      {/* Default Toggle */}
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id={`default-cat-${idx}-${cat.id}`}
                          title="افتراضي"
                          checked={cat.showByDefault}
                          onChange={(e) =>
                            updateCategory(
                              idx,
                              "showByDefault",
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 rounded cursor-pointer"
                        />
                        <Label
                          htmlFor={`default-cat-${idx}-${cat.id}`}
                          className="text-sm cursor-pointer"
                        >
                          افتراضي
                        </Label>
                      </div>

                      {/* Delete Button */}
                      <Button
                        onClick={() => deleteCategory(idx)}
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-6"
                        aria-label="حذف التصنيف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  {categories.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>لا توجد تصنيفات حتى الآن</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Section 2: Courses by Columns ────────────── */}
          {activeSection === 2 && (
            <div className="section-animate space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold">المواد</h2>
                  <p className="text-sm text-muted-foreground">
                    {courses.length} مادة · {cols.length} أعمدة
                  </p>
                </div>
                <Button
                  onClick={() => addCourse((cols[cols.length - 1] || 0) + 1)}
                  size="sm"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  عمود جديد
                </Button>
              </div>

              <div className="editor-scroll overflow-x-auto flex gap-4 pb-4">
                {cols.map((col: number) => {
                  const colCourses = courses
                    .map((c, idx) => ({ ...c, _globalIdx: idx }))
                    .filter((c) => c.col === col);
                  return (
                    <Card
                      key={col}
                      className="min-w-[380px] flex flex-col bg-card/50 backdrop-blur"
                    >
                      <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs font-bold bg-blue-500/20 text-blue-500 rounded-md font-mono">
                            {col}
                          </span>
                          <div>
                            <p className="font-semibold">الفصل {col}</p>
                            <p className="text-xs text-muted-foreground">
                              {colCourses.length} مادة
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => addCourse(col)}
                          size="sm"
                          variant="outline"
                          className="gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span className="text-xs">مادة</span>
                        </Button>
                      </CardHeader>

                      <CardContent className="flex-1 overflow-y-auto space-y-3 px-6 pb-6 pt-0">
                        {colCourses.map((course: any, localIdx: number) => {
                          const catCol = getCatColor(course.cat);
                          return (
                            <Card
                              key={course.id + course._globalIdx}
                              className="p-4 bg-background/50 border-l-4 hover:shadow-md transition-shadow"
                              style={{ borderLeftColor: catCol }}
                            >
                              {/* Header row */}
                              <div className="flex justify-between items-start gap-2 mb-3">
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() =>
                                      moveCourse(col, localIdx, -1)
                                    }
                                    disabled={localIdx === 0}
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    title="تحريك لأعلى"
                                  >
                                    <ChevronUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    onClick={() => moveCourse(col, localIdx, 1)}
                                    disabled={
                                      localIdx === colCourses.length - 1
                                    }
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    title="تحريك لأسفل"
                                  >
                                    <ChevronDown className="w-3 h-3" />
                                  </Button>
                                </div>
                                <Input
                                  value={course.id}
                                  onChange={(e) =>
                                    updateCourse(
                                      course._globalIdx,
                                      "id",
                                      e.target.value,
                                    )
                                  }
                                  aria-label="معرف المادة"
                                  className="h-7 text-xs font-mono w-20 text-center"
                                  dir="ltr"
                                />
                                <Button
                                  onClick={() =>
                                    deleteCourse(course._globalIdx)
                                  }
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  aria-label="حذف المادة"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>

                              {/* Name fields */}
                              <div className="space-y-2 mb-3">
                                <Input
                                  value={course.name}
                                  onChange={(e) =>
                                    updateCourse(
                                      course._globalIdx,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="الاسم بالعربي"
                                  className="h-8 text-sm"
                                />
                                <Input
                                  value={course.nameEn}
                                  onChange={(e) =>
                                    updateCourse(
                                      course._globalIdx,
                                      "nameEn",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="English Name"
                                  className="h-8 text-xs text-muted-foreground"
                                  dir="ltr"
                                />
                                <Input
                                  value={course.courseSystemId || ""}
                                  onChange={(e) =>
                                    updateCourse(
                                      course._globalIdx,
                                      "courseSystemId",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="معرف النظام"
                                  className="h-8 text-xs text-muted-foreground"
                                  dir="ltr"
                                />
                              </div>

                              {/* Category + Credits row */}
                              <div className="space-y-2 mb-3">
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="col-span-2">
                                    <Select
                                      value={course.cat}
                                      onValueChange={(val) =>
                                        updateCourse(
                                          course._globalIdx,
                                          "cat",
                                          val,
                                        )
                                      }
                                    >
                                      <SelectTrigger
                                        className="h-8 text-xs"
                                        size="sm"
                                      >
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {categories.map((c) => (
                                          <SelectItem key={c.id} value={c.id}>
                                            <div className="flex items-center gap-2">
                                              <div
                                                className="w-2 h-2 rounded-full"
                                                style={{
                                                  background: c.color,
                                                }}
                                              />
                                              {c.label}
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center gap-1 bg-muted rounded-md px-2">
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={course.credits}
                                      onChange={(e) =>
                                        updateCourse(
                                          course._globalIdx,
                                          "credits",
                                          Number(e.target.value),
                                        )
                                      }
                                      aria-label="عدد الساعات"
                                      className="h-8 border-0 bg-transparent text-center text-sm font-bold p-0"
                                    />
                                    <span className="text-xs text-muted-foreground">
                                      س
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* isMain toggle */}
                              <div className="flex items-center gap-2 mb-3">
                                <input
                                  type="checkbox"
                                  id={`main-course-${course._globalIdx}-${course.id}`}
                                  title="نوع المادة"
                                  checked={course.isMain}
                                  onChange={(e) =>
                                    updateCourse(
                                      course._globalIdx,
                                      "isMain",
                                      e.target.checked,
                                    )
                                  }
                                  className="w-4 h-4 rounded cursor-pointer"
                                />
                                <Label
                                  htmlFor={`main-course-${course._globalIdx}-${course.id}`}
                                  className="text-xs cursor-pointer"
                                >
                                  {course.isMain ? "أساسية" : "ثانوية"}
                                </Label>
                              </div>

                              {/* Prerequisites */}
                              <Input
                                value={
                                  course.prereqs
                                    ? course.prereqs.join(", ")
                                    : ""
                                }
                                onChange={(e) =>
                                  updateCourse(
                                    course._globalIdx,
                                    "prereqs",
                                    e.target.value
                                      ? e.target.value
                                          .split(",")
                                          .map((s: string) => s.trim())
                                          .filter((s: string) => s)
                                      : [],
                                  )
                                }
                                placeholder="المتطلبات: 185101, 185109"
                                className="h-8 text-xs text-muted-foreground"
                                dir="ltr"
                              />
                            </Card>
                          );
                        })}

                        {colCourses.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <div className="text-3xl mb-2">📭</div>
                            <p className="text-sm">
                              لا توجد مواد في هذا العمود
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
