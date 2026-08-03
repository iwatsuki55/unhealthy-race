# Cardio Domain

Owns cardio session concepts such as activity type, distance, duration, pace, heart rate, cadence,
calories, perceived effort, notes, and screenshot references.

The current persistence table is still mapped to `runs` for backward compatibility. New application
code should use Cardio names and treat running as one cardio activity type.
