import { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Loader2 } from "lucide-react";
import {
  fetchUniversities,
  fetchFacultiesByUniversity,
  fetchMajorsByFaculty,
} from "@/features/courses/api";
import type { University, Faculty, Major } from "@/features/courses/types";
import type {
  CreateProductCourseRequest,
  UpdateProductCourseRequest,
  ProductCourse,
} from "../types";

interface ProductCourseFormProps {
  initialData?: ProductCourse | null;
  academicCourseId?: number;
  onSubmit: (data: CreateProductCourseRequest | UpdateProductCourseRequest) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

export default function ProductCourseForm({
  initialData,
  academicCourseId,
  onSubmit,
  isSubmitting,
  submitLabel = "Save",
}: ProductCourseFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(initialData?.price ?? 0);
  const [isFree, setIsFree] = useState(initialData?.isFree ?? false);
  const [thumbnailUrl, setThumbnailUrl] = useState(initialData?.thumbnailUrl ?? "");
  const [trialVideoUrl, setTrialVideoUrl] = useState(initialData?.trialVideoUrl ?? "");
  const [universityId, setUniversityId] = useState<number | undefined>(
    initialData?.universityId ?? undefined
  );
  const [facultyId, setFacultyId] = useState<number | undefined>(
    initialData?.facultyId ?? undefined
  );
  const [majorId, setMajorId] = useState<number | undefined>(
    initialData?.majorId ?? undefined
  );

  // Options
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);

  // Load universities on mount
  useEffect(() => {
    fetchUniversities(1, 100)
      .then((res) => setUniversities(res.items))
      .catch(console.error);
  }, []);

  // Load faculties when university changes
  useEffect(() => {
    if (universityId) {
      fetchFacultiesByUniversity(universityId, 1, 100)
        .then((res) => setFaculties(res.items))
        .catch(console.error);
    } else {
      setFaculties([]);
      setFacultyId(undefined);
    }
  }, [universityId]);

  // Load majors when faculty changes
  useEffect(() => {
    if (facultyId) {
      fetchMajorsByFaculty(facultyId, 1, 100)
        .then((res) => setMajors(res.items))
        .catch(console.error);
    } else {
      setMajors([]);
      setMajorId(undefined);
    }
  }, [facultyId]);

  // Auto-set price to 0 when isFree
  useEffect(() => {
    if (isFree) setPrice(0);
  }, [isFree]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: CreateProductCourseRequest = {
      title: title.trim(),
      price,
      isFree,
      description: description.trim() || undefined,
      academicCourseId: academicCourseId ?? undefined,
      universityId,
      facultyId,
      majorId,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      trialVideoUrl: trialVideoUrl.trim() || undefined,
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={250}
          required
          placeholder="Enter course title"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={5000}
          rows={4}
          placeholder="Enter course description"
        />
      </div>

      {/* Price & Free toggle */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            disabled={isFree}
            required
          />
        </div>
        <div className="flex items-end gap-2 pb-2">
          <Checkbox
            id="isFree"
            checked={isFree}
            onCheckedChange={(checked) => setIsFree(checked === true)}
          />
          <Label htmlFor="isFree" className="cursor-pointer">
            Free course
          </Label>
        </div>
      </div>

      {/* Thumbnail URL */}
      <div className="space-y-2">
        <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
        <Input
          id="thumbnailUrl"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          maxLength={1000}
          placeholder="https://..."
        />
      </div>

      {/* Trial / Preview Video URL */}
      <div className="space-y-2">
        <Label htmlFor="trialVideoUrl">Trial / Preview Video URL</Label>
        <Input
          id="trialVideoUrl"
          value={trialVideoUrl}
          onChange={(e) => setTrialVideoUrl(e.target.value)}
          maxLength={1000}
          placeholder="https://..."
        />
        <p className="text-xs text-muted-foreground">
          A short public video shown to visitors before they enroll.
        </p>
      </div>

      {/* University / Faculty / Major dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>University</Label>
          <Select
            value={universityId?.toString() ?? ""}
            onValueChange={(val) =>
              setUniversityId(val ? parseInt(val) : undefined)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent>
              {universities.map((u) => (
                <SelectItem key={u.id} value={u.id.toString()}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Faculty</Label>
          <Select
            value={facultyId?.toString() ?? ""}
            onValueChange={(val) =>
              setFacultyId(val ? parseInt(val) : undefined)
            }
            disabled={!universityId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select faculty" />
            </SelectTrigger>
            <SelectContent>
              {faculties.map((f) => (
                <SelectItem key={f.id} value={f.id.toString()}>
                  {f.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Major</Label>
          <Select
            value={majorId?.toString() ?? ""}
            onValueChange={(val) =>
              setMajorId(val ? parseInt(val) : undefined)
            }
            disabled={!facultyId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select major" />
            </SelectTrigger>
            <SelectContent>
              {majors.map((m) => (
                <SelectItem key={m.id} value={m.id.toString()}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting || !title.trim()} className="w-full cursor-pointer">
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
