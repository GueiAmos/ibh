
-- Supprimer toutes les tables existantes dans le bon ordre (en tenant compte des dépendances)
DROP TABLE IF EXISTS public.activity_images CASCADE;
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.quiz_results CASCADE;
DROP TABLE IF EXISTS public.stories CASCADE;
DROP TABLE IF EXISTS public.voice_recordings CASCADE;
DROP TABLE IF EXISTS public.note_beats CASCADE;
DROP TABLE IF EXISTS public.folder_items CASCADE;
DROP TABLE IF EXISTS public.beats CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.folders CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Supprimer les fonctions existantes
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_profiles_updated_at() CASCADE;

-- Créer la table profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  username TEXT,
  PRIMARY KEY (id)
);

-- Créer la table folders
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'blue',
  PRIMARY KEY (id)
);

-- Créer la table notes
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  audio_url TEXT,
  PRIMARY KEY (id)
);

-- Créer la table beats
CREATE TABLE public.beats (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  PRIMARY KEY (id)
);

-- Créer la table note_beats (relation entre notes et beats)
CREATE TABLE public.note_beats (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL,
  beat_id UUID NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE,
  FOREIGN KEY (beat_id) REFERENCES public.beats(id) ON DELETE CASCADE
);

-- Créer la table folder_items
CREATE TABLE public.folder_items (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE CASCADE
);

-- Créer la table voice_recordings
CREATE TABLE public.voice_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  note_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (note_id) REFERENCES public.notes(id) ON DELETE CASCADE
);

-- Créer la table stories
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  audio_url TEXT,
  image_url TEXT,
  quiz JSONB,
  PRIMARY KEY (id)
);

-- Créer la table quiz_results
CREATE TABLE public.quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  story_id UUID,
  story_title TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  answers JSONB,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE SET NULL
);

-- Créer la table activities
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  coverimage TEXT NOT NULL,
  PRIMARY KEY (id)
);

-- Créer la table activity_images
CREATE TABLE public.activity_images (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  activityid UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  caption TEXT NOT NULL,
  src TEXT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (activityid) REFERENCES public.activities(id) ON DELETE CASCADE
);

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folder_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Politiques RLS pour folders
CREATE POLICY "Users can view their own folders" ON public.folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own folders" ON public.folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own folders" ON public.folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own folders" ON public.folders FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour notes
CREATE POLICY "Users can view their own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour beats
CREATE POLICY "Users can view their own beats" ON public.beats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own beats" ON public.beats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own beats" ON public.beats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own beats" ON public.beats FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour note_beats
CREATE POLICY "Anyone can view note beats" ON public.note_beats FOR SELECT USING (true);
CREATE POLICY "Users can create note beat associations" ON public.note_beats FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.notes WHERE notes.id = note_beats.note_id AND notes.user_id = auth.uid()));
CREATE POLICY "Users can update their own note beat associations" ON public.note_beats FOR UPDATE USING (EXISTS (SELECT 1 FROM public.notes WHERE notes.id = note_beats.note_id AND notes.user_id = auth.uid()));
CREATE POLICY "Users can delete their own note beat associations" ON public.note_beats FOR DELETE USING (EXISTS (SELECT 1 FROM public.notes WHERE notes.id = note_beats.note_id AND notes.user_id = auth.uid()));

-- Politiques RLS pour folder_items
CREATE POLICY "Users can view items in their own folders" ON public.folder_items FOR SELECT USING (folder_id IN (SELECT id FROM public.folders WHERE user_id = auth.uid()));
CREATE POLICY "Users can add items to their own folders" ON public.folder_items FOR INSERT WITH CHECK (folder_id IN (SELECT id FROM public.folders WHERE user_id = auth.uid()));
CREATE POLICY "Users can update items in their own folders" ON public.folder_items FOR UPDATE USING (folder_id IN (SELECT id FROM public.folders WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete items from their own folders" ON public.folder_items FOR DELETE USING (folder_id IN (SELECT id FROM public.folders WHERE user_id = auth.uid()));

-- Politiques RLS pour voice_recordings
CREATE POLICY "Users can view their own voice recordings" ON public.voice_recordings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own voice recordings" ON public.voice_recordings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own voice recordings" ON public.voice_recordings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own voice recordings" ON public.voice_recordings FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour stories
CREATE POLICY "Users can view their own stories" ON public.stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stories" ON public.stories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stories" ON public.stories FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour quiz_results
CREATE POLICY "Users can view their own quiz results" ON public.quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own quiz results" ON public.quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quiz results" ON public.quiz_results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quiz results" ON public.quiz_results FOR DELETE USING (auth.uid() = user_id);

-- Créer la fonction pour gérer les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$;

-- Créer la fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Créer le trigger pour les nouveaux utilisateurs
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Créer le trigger pour updated_at sur notes
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();
