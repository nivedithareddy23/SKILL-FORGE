
-- Create enums
CREATE TYPE public.app_role AS ENUM ('student', 'instructor', 'admin');
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'student',
  UNIQUE(user_id, role)
);

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty_level difficulty_level NOT NULL DEFAULT 'beginner',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Course enrollments
CREATE TABLE public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  progress DECIMAL(5,2) DEFAULT 0,
  UNIQUE(course_id, student_id)
);

-- Course materials
CREATE TABLE public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  material_type TEXT NOT NULL DEFAULT 'link',
  content_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  generated_by_ai BOOLEAN DEFAULT false,
  difficulty_level difficulty_level NOT NULL DEFAULT 'beginner',
  time_limit_minutes INT DEFAULT 30,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score DECIMAL(5,2),
  answers JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + default student role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: everyone can read, users update own
CREATE POLICY "Profiles readable by all authenticated" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- User roles: readable by authenticated, manageable by admins
CREATE POLICY "Roles readable by authenticated" ON public.user_roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Courses: readable by all, manageable by instructors/admins
CREATE POLICY "Courses readable by all" ON public.courses
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Instructors create courses" ON public.courses
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = instructor_id AND (public.has_role(auth.uid(), 'instructor') OR public.has_role(auth.uid(), 'admin')));
CREATE POLICY "Instructors update own courses" ON public.courses
  FOR UPDATE TO authenticated
  USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors delete own courses" ON public.courses
  FOR DELETE TO authenticated
  USING (auth.uid() = instructor_id OR public.has_role(auth.uid(), 'admin'));

-- Enrollments
CREATE POLICY "Students see own enrollments" ON public.enrollments
  FOR SELECT TO authenticated USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'instructor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Students enroll themselves" ON public.enrollments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students unenroll themselves" ON public.enrollments
  FOR DELETE TO authenticated USING (auth.uid() = student_id);

-- Course materials
CREATE POLICY "Materials readable by enrolled or instructor" ON public.course_materials
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Instructors manage materials" ON public.course_materials
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()));

-- Quizzes
CREATE POLICY "Published quizzes readable" ON public.quizzes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Instructors manage quizzes" ON public.quizzes
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND instructor_id = auth.uid()));

-- Questions
CREATE POLICY "Questions readable" ON public.questions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Instructors manage questions" ON public.questions
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.quizzes q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = quiz_id AND c.instructor_id = auth.uid()
  ));

-- Quiz attempts
CREATE POLICY "Students see own attempts" ON public.quiz_attempts
  FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR public.has_role(auth.uid(), 'instructor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Students create attempts" ON public.quiz_attempts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students update own attempts" ON public.quiz_attempts
  FOR UPDATE TO authenticated USING (auth.uid() = student_id);
