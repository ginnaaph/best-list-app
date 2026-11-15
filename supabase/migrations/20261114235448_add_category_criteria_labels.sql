ALTER TABLE public.categories
  ADD COLUMN criterion_1_label text NOT NULL DEFAULT 'Taste',
  ADD CONSTRAINT criterion_1_label_valid CHECK (
    btrim(criterion_1_label) <> ''
    AND char_length(criterion_1_label) <= 15
  );

  ALTER TABLE public.categories
  ADD COLUMN criterion_2_label text NOT NULL DEFAULT 'Value',
  ADD CONSTRAINT criterion_2_label_valid CHECK (
    btrim(criterion_2_label) <> ''
    AND char_length(criterion_2_label) <= 15
  );

  ALTER TABLE public.categories
  ADD COLUMN criterion_3_label text NOT NULL DEFAULT 'Portion',
  ADD CONSTRAINT criterion_3_label_valid CHECK (
    btrim(criterion_3_label) <> ''
    AND char_length(criterion_3_label) <= 15
  );

  ALTER TABLE public.categories
  ADD COLUMN criterion_4_label text NOT NULL DEFAULT 'Vibe',
  ADD CONSTRAINT criterion_4_label_valid CHECK (
    btrim(criterion_4_label) <> ''
    AND char_length(criterion_4_label) <= 15
  );