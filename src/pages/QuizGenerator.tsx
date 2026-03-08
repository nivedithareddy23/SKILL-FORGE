import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles, Save, Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];

interface GeneratedQuestion {
  question_text: string;
  options: string[];
  correct_answer: string;
}

export default function QuizGenerator() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("intermediate");
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("courses").select("id, title").eq("instructor_id", user.id)
      .then(({ data }) => setCourses(data || []));
  }, [user]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { topic, difficulty, numQuestions },
      });
      if (error) throw error;
      if (data?.questions) {
        setQuestions(data.questions);
        toast.success(`Generated ${data.questions.length} questions!`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to generate quiz");
    }
    setGenerating(false);
  };

  const handleSave = async () => {
    if (!selectedCourse || questions.length === 0) {
      toast.error("Select a course and generate questions first");
      return;
    }
    setSaving(true);
    try {
      const { data: quiz, error: quizErr } = await supabase.from("quizzes").insert({
        course_id: selectedCourse,
        title: `${topic} Quiz`,
        generated_by_ai: true,
        difficulty_level: difficulty,
        is_published: false,
      }).select().single();
      if (quizErr) throw quizErr;

      const questionsToInsert = questions.map((q, i) => ({
        quiz_id: quiz.id,
        question_text: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        sort_order: i,
      }));
      const { error: qErr } = await supabase.from("questions").insert(questionsToInsert);
      if (qErr) throw qErr;

      toast.success("Quiz saved! You can publish it from your course.");
      setQuestions([]);
      setTopic("");
    } catch (err: any) {
      toast.error(err.message || "Failed to save quiz");
    }
    setSaving(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">AI Quiz Generator</h1>
          <p className="text-muted-foreground">Generate quiz questions using AI, review them, and save to a course.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-display">Generate Questions</CardTitle>
            <CardDescription>Enter a topic and difficulty to generate quiz questions with AI.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Topic</Label>
                <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. React Hooks" maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as DifficultyLevel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Input type="number" min={1} max={20} value={numQuestions} onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)} />
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="w-full">
              {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate with AI</>}
            </Button>
          </CardContent>
        </Card>

        {questions.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-display">Generated Questions ({questions.length})</CardTitle>
              <Button onClick={handleSave} disabled={saving || !selectedCourse}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Quiz</>}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {questions.map((q, i) => (
                <div key={i} className="rounded-xl border border-border p-4 space-y-2">
                  <p className="font-medium text-foreground">
                    <span className="text-primary font-display mr-2">Q{i + 1}.</span>
                    {q.question_text}
                  </p>
                  <div className="grid gap-1.5 pl-6">
                    {q.options.map((opt, j) => (
                      <p key={j} className={`text-sm rounded-lg px-3 py-1.5 ${opt === q.correct_answer ? "bg-success/10 text-success font-medium" : "text-muted-foreground"}`}>
                        {String.fromCharCode(65 + j)}. {opt}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
