import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import PrepaidCodeForm from "../components/PrepaidCodeForm";
import type { PrepaidCode } from "../types";
import { useProductCourse } from "../hooks/useProductCourses";

const PrepaidCodesPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const courseId = parseInt(id || "0");
  const { course } = useProductCourse(courseId);
  const [generatedCodes, setGeneratedCodes] = useState<PrepaidCode[]>([]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <Button
        variant="ghost"
        className="mb-4 gap-2 cursor-pointer"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <h1 className="text-2xl font-bold mb-2">Prepaid Codes</h1>
      {course && (
        <p className="text-muted-foreground mb-6">{course.title}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate form */}
        <Card>
          <CardHeader>
            <CardTitle>Generate New Code</CardTitle>
          </CardHeader>
          <CardContent>
            <PrepaidCodeForm
              productCourseId={courseId}
              onCreated={(code) =>
                setGeneratedCodes((prev) => [code, ...prev])
              }
            />
          </CardContent>
        </Card>

        {/* Generated codes list */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Codes ({generatedCodes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedCodes.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No codes generated yet.
              </p>
            ) : (
              <div className="space-y-2">
                {generatedCodes.map((code) => (
                  <div
                    key={code.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-mono font-bold">{code.code}</p>
                      <p className="text-xs text-muted-foreground">
                        Value: ${code.value} · Qty: {code.quantity}
                      </p>
                    </div>
                    <Badge
                      variant={code.isActive ? "default" : "secondary"}
                    >
                      {code.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrepaidCodesPage;
