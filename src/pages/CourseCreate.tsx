import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];

export default function CourseCreate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("beginner");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("courses").insert({
      title: title.trim(),
      description: description.trim(),
      difficulty_level: difficulty,
      instructor_id: user.id,
    });
    if (error) {
      toast.error("Failed to create course");
    } else {
      toast.success("Course created!");
      navigate("/courses");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">Create New Course</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Introduction to Machine Learning" required maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Course description..." rows={4} maxLength={1000} />
              </div>
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Course"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
