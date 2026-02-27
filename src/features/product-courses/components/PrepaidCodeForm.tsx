import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Loader2, Plus } from "lucide-react";
import { createPrepaidCode } from "../api";
import { toast } from "sonner";
import type { PrepaidCode } from "../types";

interface PrepaidCodeFormProps {
  productCourseId?: number;
  onCreated?: (code: PrepaidCode) => void;
}

export default function PrepaidCodeForm({
  productCourseId,
  onCreated,
}: PrepaidCodeFormProps) {
  const [value, setValue] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [scopeType, setScopeType] = useState<0 | 1 | 2>(
    productCourseId ? 1 : 0
  );
  const [scopeReferenceId, setScopeReferenceId] = useState<number | undefined>(
    productCourseId
  );
  const [isReusable, setIsReusable] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const code = await createPrepaidCode({
        value,
        quantity,
        scopeType,
        scopeReferenceId,
        isReusable,
        expirationDate: expirationDate || undefined,
      });
      toast.success(`Prepaid code created: ${code.code}`);
      onCreated?.(code);
      // Reset
      setValue(0);
      setQuantity(1);
      setIsReusable(false);
      setExpirationDate("");
    } catch (err) {
      console.error("Failed to create prepaid code:", err);
      toast.error("Failed to create prepaid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codeValue">Value *</Label>
          <Input
            id="codeValue"
            type="number"
            step="0.01"
            min="0"
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="codeQty">Quantity *</Label>
          <Input
            id="codeQty"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Scope Type</Label>
        <Select
          value={scopeType.toString()}
          onValueChange={(val) => setScopeType(parseInt(val) as 0 | 1 | 2)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Global</SelectItem>
            <SelectItem value="1">Course</SelectItem>
            <SelectItem value="2">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {scopeType !== 0 && (
        <div className="space-y-2">
          <Label htmlFor="scopeRef">Scope Reference ID</Label>
          <Input
            id="scopeRef"
            type="number"
            value={scopeReferenceId ?? ""}
            onChange={(e) =>
              setScopeReferenceId(
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
            placeholder={
              scopeType === 1 ? "Product Course ID" : "Category ID"
            }
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="expDate">Expiration Date</Label>
        <Input
          id="expDate"
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isReusable"
          checked={isReusable}
          onCheckedChange={(c) => setIsReusable(c === true)}
        />
        <Label htmlFor="isReusable" className="cursor-pointer">
          Reusable code
        </Label>
      </div>

      <Button type="submit" disabled={loading} className="w-full cursor-pointer">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Generate Prepaid Code
          </>
        )}
      </Button>
    </form>
  );
}
