# Workout Import Module

Stage 1 implements a temporary browser-based import session for multi-screenshot strength workout import.

The module owns upload ordering, duplicate prevention, structured image extraction, confidence metadata, warnings, and the draft review shell. It does not save Strength Sessions yet.

Image analysis runs through the server-side workout extraction provider. Production requires `OPENAI_API_KEY`; `OPENAI_WORKOUT_IMPORT_MODEL` can override the default model.

Image retention policy for the MVP is option B: original screenshots should be retained only when the user explicitly chooses to keep them. In Stage 1, screenshots are used as local browser preview URLs and are not persisted to the Health OS database.
