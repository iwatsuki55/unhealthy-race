# Product Requirements Document: Health OS MVP

## 0. Document Purpose

This document defines the MVP requirements for Health OS.

The MVP must be evaluated as a focused first version of a long-term personal health operating system, not as a generic fitness tracker or a running-only app.

No implementation details in this PRD should be interpreted as permission to include features outside the MVP scope.

## 1. Project Vision

Health OS is a personal digital health platform designed to become an AI-powered operating system for personal health management.

The long-term vision is to unify health, training, recovery, lifestyle, biometric, calendar, and AI coaching data into one modular system.

The MVP does not attempt to build the full operating system. Instead, it establishes the first usable foundation around manually logged training data, route management, and goal tracking.

The MVP should validate the following product idea:

> A personal health system becomes useful when it helps the user decide what matters today, log training quickly, manage repeatable routes, and track goals from one calm home screen.

## 2. Target User

The current target user is only the product owner.

The MVP is not designed for multiple external users, teams, public profiles, coaches, or SaaS monetization.

However, the system should still include a user ownership model internally so future multi-user support can be added without rewriting core data models.

### User Characteristics

- Wants to track running activity manually.
- Wants to track strength training manually.
- Wants to manage frequently used running routes.
- Wants to create goals and monitor progress.
- Wants a simple Today home screen for current training status, active goals, and quick logging.
- Wants future expansion into broader health modules.
- Values long-term architecture but does not want an over-engineered MVP.

## 3. MVP Scope

The MVP must include only these modules and capabilities:

1. Today Home
2. Running Log
3. Strength Training Log
4. Route Management
5. Goal Management
6. Journal

Anything outside these six areas is not part of the MVP.

## 4. MVP Goals

The MVP should achieve the following:

1. Allow the user to record running sessions manually.
2. Allow the user to record strength training sessions manually.
3. Allow the user to create and manage running routes.
4. Allow the user to create and manage goals.
5. Allow the user to capture short daily journal notes.
6. Show today's workout focus, active goals, quick logging actions, and recent context on a Today home screen.
7. Establish modular domain boundaries for future Health OS modules.
8. Keep the first version simple enough to build and use quickly.

## 5. Product Principles

### 5.1 Modular by Default

Running, strength training, routes, goals, journal, and Today home concerns should be separated cleanly.

Future modules should be addable without modifying existing modules whenever reasonably possible.

### 5.2 Domain Driven Design Where Appropriate

The system should use Domain Driven Design concepts where they provide clarity:

- Entities
- Value objects
- Application services
- Repository interfaces
- Module boundaries
- Domain-specific validation

DDD should not be applied so heavily that the MVP becomes slow to build or hard to understand.

### 5.3 Composition Over Inheritance

Shared behavior should be composed through services, interfaces, helpers, and module contracts rather than deep inheritance hierarchies.

### 5.4 Manual First

The MVP should work without Apple Health, Garmin, Strava, Google Calendar, or AI integrations.

Manual entry is the primary workflow.

### 5.5 Today Home as Command Center

The Today home screen should act as the first screen for deciding what matters today and moving quickly into logging workflows.

## 6. User Stories

### 6.1 Today Home

As the user, I want to see today's workout focus so that I can quickly decide what to do today.

As the user, I want to see active goals and today's relevant progress so that I can tell whether I am on track.

As the user, I want to see recent running, strength, and journal context so that today's decision is grounded in recent history.

As the user, I want quick actions from Today so that I can add a run, strength session, journal entry, route, or goal without unnecessary navigation.

### 6.2 Running Log

As the user, I want to manually add a running session so that I can track my training without external integrations.

As the user, I want to record distance, duration, route, effort, heart rate, cadence, calories, weather context, shoes, and notes so that I can review both training volume and context.

As the user, I want pace to be calculated automatically so that I do not need to compute it myself.

As the user, I want to edit or delete a run so that I can correct mistakes.

As the user, I want to attach a screenshot reference to a run so that I can preserve details from another app without building full external integrations yet.

### 6.3 Strength Training Log

As the user, I want to manually add a strength training session so that I can track gym or home workouts.

As the user, I want to record workout type, exercises, equipment type, sets, reps, weight, rest time, effort, and notes so that I can review progressive overload and workout structure.

As the user, I want to view prior strength sessions so that I can decide what to do next time.

As the user, I want to edit or delete a session so that I can correct mistakes.

### 6.4 Route Management

As the user, I want to create reusable running routes so that I do not need to re-enter the same route information every time.

As the user, I want to store distance, estimated duration, elevation gain, surface type, difficulty, Google Maps URL, favorite status, and notes for each route so that I can choose routes intentionally.

As the user, I want to link a run to a route so that route-based history becomes visible.

As the user, I want to deactivate routes I no longer use so that historical records remain intact.

### 6.5 Goal Management

As the user, I want to create running, strength, weight, body fat, pace, race, and custom health goals so that my health system has direction beyond simple training frequency.

As the user, I want goals to have a date range and target value so that progress can be calculated.

As the user, I want to view goal progress so that I can tell whether I am on track.

As the user, I want to pause, complete, or archive goals so that the goal list stays relevant.

### 6.6 Journal

As the user, I want to write a short daily note so that subjective context is captured alongside training logs.

As the user, I want to record fatigue, recovery, mood, work stress, alcohol, sauna, and other short observations so that future analysis has context.

As the user, I want to view recent journal entries so that I can remember how I felt around workouts.

## 7. Functional Requirements

## 7.1 Today Home

The Today home screen must show:

- Today's date and daily focus area.
- Today's planned or suggested workout placeholder.
- Active goals with progress.
- Goals that are most relevant today.
- Recent running sessions.
- Recent strength training sessions.
- Most recent journal entry.
- Quick actions for adding a run, strength session, journal entry, route, and goal.
- Lightweight weekly context, such as current week running distance and strength session count.

Today should be action-focused and should not contain complex editing flows.

## 7.2 Running Log

The system must allow the user to:

- Create a run.
- View a list of runs.
- View run details.
- Edit a run.
- Delete a run.
- Optionally link a run to a route.

### Run Fields

- Date
- Optional start time
- Duration
- Distance
- Optional route
- Automatically calculated average pace
- Optional average heart rate
- Optional maximum heart rate
- Optional cadence
- Optional calories
- Optional temperature
- Optional humidity
- Optional shoes
- Optional screenshot attachment reference
- Optional perceived effort
- Optional notes

### Running Log Rules

- Distance must be greater than zero.
- Duration must be greater than zero.
- Average pace must be derived from distance and duration.
- Average heart rate and maximum heart rate must be positive numbers when provided.
- Maximum heart rate should not be lower than average heart rate when both are provided.
- Cadence, calories, temperature, and humidity are optional manual fields.
- Shoes should be stored as text in MVP, not as a full equipment inventory module.
- Screenshot attachment reference should store a reference path or URL, not binary file handling requirements.
- A run can exist without a route.
- Runs should be listed in reverse chronological order.
- Route deletion should not delete historical runs.

## 7.3 Strength Training Log

The system must allow the user to:

- Create a strength session.
- View a list of strength sessions.
- View strength session details.
- Edit a strength session.
- Delete a strength session.
- Add multiple exercises to a session.
- Add multiple sets to each exercise.

### Strength Session Fields

- Date
- Optional start time
- Optional duration
- Workout type
- Optional location
- Optional notes

### Exercise Fields

- Exercise name
- Exercise order
- Equipment type
- Optional notes

### Set Fields

- Set order
- Reps
- Optional weight value
- Weight unit
- Optional rest seconds
- Optional perceived effort
- Optional notes

### Strength Training Rules

- A strength session must have a date.
- Workout type should be selected from a controlled list.
- A strength session should contain at least one exercise.
- An exercise should contain at least one set.
- Equipment type should be selected per exercise.
- Reps must be greater than zero.
- Set order should be preserved.
- Exercise order should be preserved.

## 7.4 Route Management

The system must allow the user to:

- Create a route.
- View a list of routes.
- View route details.
- Edit a route.
- Delete or deactivate a route.
- View runs associated with a route.

### Route Fields

- Name
- Distance
- Optional estimated duration
- Optional elevation gain
- Optional description
- Surface type
- Difficulty
- Optional Google Maps URL
- Favorite flag
- Active status
- Optional notes

### Route Rules

- Route name is required.
- Distance must be greater than zero.
- Estimated duration and elevation gain must be positive numbers when provided.
- Google Maps URL must be a valid URL when provided.
- Routes can be linked to many runs.
- MVP does not include maps, GPS traces, or GPX upload.
- Prefer deactivation over deletion if a route has historical runs.

## 7.5 Goal Management

The system must allow the user to:

- Create a goal.
- View a list of goals.
- View goal details.
- Edit a goal.
- Delete or archive a goal.
- See calculated progress for supported goal types.

### Goal Fields

- Title
- Module
- Goal type
- Target value
- Target unit
- Optional current value
- Optional race date
- Optional race distance
- Optional race target time
- Period start
- Period end
- Status
- Optional notes

### Supported Goal Modules

- Running
- Strength
- Weight
- Body fat
- Race
- Health
- General

### Supported Goal Types

- Running distance
- Running frequency
- Pace
- Race completion
- Race time
- Strength frequency
- Weight target
- Weight change
- Body fat target
- Body fat change
- Custom health
- Custom

### Goal Statuses

- Active
- Completed
- Paused
- Archived

### Goal Rules

- Target value must be greater than zero.
- Period end must be after period start.
- Progress should be calculated from existing logs where possible.
- Weight and body fat goals may use manually updated current values in MVP if dedicated Weight and Body Fat modules do not exist yet.
- Pace goals should compare target pace against running logs.
- Race goals should support a race date, race distance, and optional target time.
- Custom goals may allow manual or placeholder progress in MVP.
- Active goals should appear on Today.

## 7.6 Journal

The system must allow the user to:

- Create a journal entry.
- View a list of journal entries.
- View journal entry details.
- Edit a journal entry.
- Delete a journal entry.
- See the most recent journal entry on Today.

### Journal Fields

- Date
- Optional mood rating
- Optional fatigue rating
- Optional recovery rating
- Optional work stress rating
- Optional alcohol note
- Optional sauna note
- Optional freeform tags
- Note body

### Journal Rules

- A journal entry must have a date.
- Note body should support short freeform text.
- Mood, fatigue, recovery, and work stress are optional simple ratings.
- Alcohol and sauna are notes in MVP, not full tracking modules.
- Multiple entries per day are allowed, but Today should show the most recent entry.

## 8. Non-Functional Requirements

## 8.1 Scalability

- The application should begin as a modular monolith.
- Each major feature should have clear module boundaries.
- Future modules should be addable without changing existing module internals.
- Today should consume module-level query outputs rather than directly owning all business logic.

## 8.2 Maintainability

- Use TypeScript or equivalent static typing.
- Keep domain logic out of UI components.
- Use validation schemas for user input.
- Prefer explicit domain models over loose untyped records.
- Keep module dependencies directional and predictable.

## 8.3 Performance

- Today should load quickly for personal-use data volumes.
- Query patterns should use user and date indexes.
- MVP can calculate summaries on demand.
- Precomputed summaries are not required in MVP.

## 8.4 Security and Privacy

- All health and training records should be treated as private personal data.
- Data should be scoped to the current user.
- Secrets should be stored in environment variables.
- Logs should not expose unnecessary personal health details.

## 8.5 Reliability

- Forms should validate required fields.
- Destructive actions should require confirmation.
- Database migrations should be tracked.
- Basic tests should cover domain calculations and critical workflows.

## 8.6 Usability

- The system should be usable on desktop and mobile-width screens.
- Logging a run or strength session should be fast.
- Empty states should guide the user toward the first action.
- UI should be calm, practical, and easy to scan.

## 9. Screen List

### 9.1 Today

Route:

- `/today`

Purpose:

- Shows today's workout focus, active goals, recent context, the latest journal note, and quick logging actions.

### 9.2 Running

Routes:

- `/running`
- `/running/new`
- `/running/:id`
- `/running/:id/edit`

Purpose:

- Create, view, edit, and delete running logs.

### 9.3 Strength Training

Routes:

- `/strength`
- `/strength/new`
- `/strength/:id`
- `/strength/:id/edit`

Purpose:

- Create, view, edit, and delete strength training sessions.

### 9.4 Routes

Routes:

- `/routes`
- `/routes/new`
- `/routes/:id`
- `/routes/:id/edit`

Purpose:

- Manage reusable running routes and view route-associated runs.

### 9.5 Goals

Routes:

- `/goals`
- `/goals/new`
- `/goals/:id`
- `/goals/:id/edit`

Purpose:

- Create, view, edit, archive, and track goals.

### 9.6 Journal

Routes:

- `/journal`
- `/journal/new`
- `/journal/:id`
- `/journal/:id/edit`

Purpose:

- Create, view, edit, and delete short daily notes.

### 9.7 Settings

Route:

- `/settings`

Purpose:

- Minimal user preferences such as timezone and unit system.

Settings are included only as supporting configuration, not as a major MVP module.

## 10. Navigation Flow

### 10.1 Primary Navigation

Primary app navigation:

1. Today
2. Running
3. Strength
4. Routes
5. Goals
6. Journal
7. Settings

### 10.2 Today Flow

From Today:

- Add Run leads to `/running/new`.
- Add Strength Session leads to `/strength/new`.
- Add Journal Entry leads to `/journal/new`.
- Add Route leads to `/routes/new`.
- Add Goal leads to `/goals/new`.
- Recent Run leads to `/running/:id`.
- Recent Strength Session leads to `/strength/:id`.
- Active Goal leads to `/goals/:id`.
- Latest Journal Entry leads to `/journal/:id`.

### 10.3 Running Flow

From Running List:

- New Run leads to `/running/new`.
- Selecting a run leads to `/running/:id`.
- Edit leads to `/running/:id/edit`.
- Delete requires confirmation.

### 10.4 Strength Flow

From Strength List:

- New Session leads to `/strength/new`.
- Selecting a session leads to `/strength/:id`.
- Edit leads to `/strength/:id/edit`.
- Delete requires confirmation.

### 10.5 Route Flow

From Routes List:

- New Route leads to `/routes/new`.
- Selecting a route leads to `/routes/:id`.
- Edit leads to `/routes/:id/edit`.
- Related runs can be viewed from route detail.
- Delete or deactivate requires confirmation.

### 10.6 Goal Flow

From Goals List:

- New Goal leads to `/goals/new`.
- Selecting a goal leads to `/goals/:id`.
- Edit leads to `/goals/:id/edit`.
- Archive or delete requires confirmation.

### 10.7 Journal Flow

From Journal List:

- New Journal Entry leads to `/journal/new`.
- Selecting an entry leads to `/journal/:id`.
- Edit leads to `/journal/:id/edit`.
- Delete requires confirmation.

## 11. Database Entities

## 11.1 User

Represents the owner of all records.

Fields:

- id
- email
- display_name
- timezone
- unit_system
- created_at
- updated_at

## 11.2 Route

Represents a reusable running route.

Fields:

- id
- user_id
- name
- distance_meters
- estimated_duration_seconds nullable
- elevation_gain_meters nullable
- description
- surface_type
- difficulty
- google_maps_url nullable
- is_favorite
- is_active
- notes
- created_at
- updated_at

Relationships:

- Belongs to User.
- Has many Runs.

## 11.3 Run

Represents one running session.

Fields:

- id
- user_id
- route_id nullable
- run_date
- started_at nullable
- duration_seconds
- distance_meters
- average_pace_seconds_per_km
- average_heart_rate nullable
- maximum_heart_rate nullable
- cadence_steps_per_minute nullable
- calories nullable
- temperature_celsius nullable
- humidity_percent nullable
- shoes nullable
- screenshot_attachment_ref nullable
- perceived_effort nullable
- notes nullable
- created_at
- updated_at

Relationships:

- Belongs to User.
- Optionally belongs to Route.

## 11.4 StrengthSession

Represents one strength training session.

Fields:

- id
- user_id
- session_date
- started_at nullable
- duration_seconds nullable
- workout_type
- location nullable
- notes nullable
- created_at
- updated_at

Relationships:

- Belongs to User.
- Has many StrengthExercises.

## 11.5 StrengthExercise

Represents an exercise performed within a strength session.

Fields:

- id
- session_id
- exercise_name
- exercise_order
- equipment_type
- notes nullable
- created_at
- updated_at

Relationships:

- Belongs to StrengthSession.
- Has many StrengthSets.

## 11.6 StrengthSet

Represents one set within a strength exercise.

Fields:

- id
- exercise_id
- set_order
- reps
- weight_value nullable
- weight_unit
- rest_seconds nullable
- perceived_effort nullable
- notes nullable
- created_at
- updated_at

Relationships:

- Belongs to StrengthExercise.

## 11.7 Goal

Represents a user-defined target.

Fields:

- id
- user_id
- title
- module
- goal_type
- target_value
- target_unit
- current_value nullable
- race_date nullable
- race_distance_meters nullable
- race_target_time_seconds nullable
- period_start
- period_end
- status
- notes nullable
- created_at
- updated_at

Relationships:

- Belongs to User.

## 11.8 JournalEntry

Represents one short daily note.

Fields:

- id
- user_id
- entry_date
- mood_rating nullable
- fatigue_rating nullable
- recovery_rating nullable
- work_stress_rating nullable
- alcohol_note nullable
- sauna_note nullable
- tags_json nullable
- body
- created_at
- updated_at

Relationships:

- Belongs to User.

## 12. Recommended Enums

### 12.1 Unit System

- metric
- imperial

### 12.2 Surface Type

- road
- trail
- track
- treadmill
- mixed
- unknown

### 12.3 Difficulty

- easy
- moderate
- hard

### 12.4 Goal Module

- running
- strength
- weight
- body_fat
- race
- health
- general

### 12.5 Goal Type

- running_distance
- running_frequency
- pace
- race_completion
- race_time
- strength_frequency
- weight_target
- weight_change
- body_fat_target
- body_fat_change
- custom_health
- custom

### 12.6 Goal Status

- active
- completed
- paused
- archived

### 12.7 Weight Unit

- kg
- lb

### 12.8 Workout Type

- full_body
- upper
- lower
- push
- pull
- legs

### 12.9 Equipment Type

- machine
- free_weight
- bodyweight

## 13. Recommended Indexes

- users.email unique
- routes.user_id
- runs.user_id, runs.run_date
- runs.route_id
- strength_sessions.user_id, strength_sessions.session_date
- strength_exercises.session_id
- strength_sets.exercise_id
- goals.user_id, goals.status
- goals.user_id, goals.module
- journal_entries.user_id, journal_entries.entry_date

## 14. API Endpoints

## 14.1 Today

```http
GET /api/today
```

Returns:

- Today's date.
- Today's workout focus or placeholder.
- Active goals and relevant progress.
- Recent runs.
- Recent strength sessions.
- Latest journal entry.
- Quick logging metadata.
- Lightweight weekly context.

## 14.2 Runs

```http
GET    /api/runs
POST   /api/runs
GET    /api/runs/:id
PATCH  /api/runs/:id
DELETE /api/runs/:id
```

Create payload:

```json
{
  "runDate": "2026-07-27",
  "startedAt": "2026-07-27T06:30:00+09:00",
  "durationSeconds": 2100,
  "distanceMeters": 6000,
  "routeId": "optional-route-id",
  "averageHeartRate": 142,
  "maximumHeartRate": 171,
  "cadenceStepsPerMinute": 176,
  "calories": 430,
  "temperatureCelsius": 24,
  "humidityPercent": 68,
  "shoes": "Nike Pegasus",
  "screenshotAttachmentRef": "attachments/run-2026-07-27.png",
  "perceivedEffort": 6,
  "notes": "Easy morning run"
}
```

## 14.3 Routes

```http
GET    /api/routes
POST   /api/routes
GET    /api/routes/:id
PATCH  /api/routes/:id
DELETE /api/routes/:id
GET    /api/routes/:id/runs
```

Create payload:

```json
{
  "name": "Riverside 6K",
  "distanceMeters": 6000,
  "estimatedDurationSeconds": 2100,
  "elevationGainMeters": 35,
  "description": "Flat riverside loop",
  "surfaceType": "road",
  "difficulty": "easy",
  "googleMapsUrl": "https://maps.google.com/example",
  "isFavorite": true,
  "isActive": true,
  "notes": ""
}
```

## 14.4 Strength Sessions

```http
GET    /api/strength/sessions
POST   /api/strength/sessions
GET    /api/strength/sessions/:id
PATCH  /api/strength/sessions/:id
DELETE /api/strength/sessions/:id
```

Create payload:

```json
{
  "sessionDate": "2026-07-27",
  "startedAt": "2026-07-27T19:00:00+09:00",
  "durationSeconds": 3600,
  "workoutType": "upper",
  "location": "Gym",
  "notes": "Upper body",
  "exercises": [
    {
      "exerciseName": "Bench Press",
      "exerciseOrder": 1,
      "equipmentType": "free_weight",
      "sets": [
        {
          "setOrder": 1,
          "reps": 8,
          "weightValue": 60,
          "weightUnit": "kg",
          "restSeconds": 120,
          "perceivedEffort": 7
        }
      ]
    }
  ]
}
```

## 14.5 Goals

```http
GET    /api/goals
POST   /api/goals
GET    /api/goals/:id
PATCH  /api/goals/:id
DELETE /api/goals/:id
GET    /api/goals/:id/progress
```

Create payload:

```json
{
  "title": "Run 100km in August",
  "module": "running",
  "goalType": "running_distance",
  "targetValue": 100000,
  "targetUnit": "meters",
  "currentValue": null,
  "raceDate": null,
  "raceDistanceMeters": null,
  "raceTargetTimeSeconds": null,
  "periodStart": "2026-08-01",
  "periodEnd": "2026-08-31",
  "status": "active",
  "notes": ""
}
```

## 14.6 Journal

```http
GET    /api/journal
POST   /api/journal
GET    /api/journal/:id
PATCH  /api/journal/:id
DELETE /api/journal/:id
```

Create payload:

```json
{
  "entryDate": "2026-07-27",
  "moodRating": 4,
  "fatigueRating": 2,
  "recoveryRating": 4,
  "workStressRating": 3,
  "alcoholNote": "None",
  "saunaNote": "10 minutes",
  "tags": ["good-sleep", "busy-workday"],
  "body": "Felt steady today. Slightly tired after work but legs were fine."
}
```

## 14.7 Settings

```http
GET   /api/settings
PATCH /api/settings
```

## 15. API Rules

- All APIs must return only the current user's data.
- Input should be validated before persistence.
- Validation errors should be readable.
- Delete operations should require confirmation in the UI.
- API versioning is not required for MVP.
- Future external API consumers may justify `/api/v1`.

## 16. Development Priorities

### Priority 0: Foundation

- Application shell
- Type-safe project setup
- Database schema
- Navigation
- Basic UI system
- Single-user or simple-auth strategy

### Priority 1: Core Domain Models

- User
- Route
- Run
- StrengthSession
- StrengthExercise
- StrengthSet
- Goal
- JournalEntry
- Validation rules

### Priority 2: Route Management

- Route CRUD
- Route list
- Route detail
- Active and inactive route handling

### Priority 3: Running Log

- Run CRUD
- Route linking
- Pace calculation
- Run list and detail

### Priority 4: Strength Training Log

- Strength session CRUD
- Nested exercise and set input
- Strength list and detail

### Priority 5: Goal Management

- Goal CRUD
- Progress calculation
- Goal status handling

### Priority 6: Journal

- Journal CRUD
- Journal list and detail
- Latest journal entry support for Today

### Priority 7: Today Home

- Today's workout focus
- Recent activity context
- Active goal progress
- Quick actions
- Latest journal entry
- Lightweight weekly context

### Priority 8: Polish

- Empty states
- Loading states
- Error states
- Mobile layout
- Basic tests
- Data consistency checks

## 17. Suggested Build Order

1. Foundation
2. Route Management
3. Running Log
4. Strength Training Log
5. Goal Management
6. Journal
7. Today Home
8. Polish and validation

Rationale:

- Routes should exist before running logs because runs can reference routes.
- Goals should come after logs because goal progress depends on logged data.
- Journal should come before Today because Today displays recent subjective context.
- Today should come after core modules because it aggregates their data.

## 18. Future Features Not Included in MVP

The following features must not be included in the MVP:

- AI Coach
- Apple Health integration
- Google Calendar integration
- Garmin integration
- Strava integration
- Walking module
- Cycling module
- Sauna module
- Nutrition module
- Alcohol tracking
- Sleep tracking
- Recovery tracking
- Dedicated Weight module
- Dedicated Body Fat module
- Blood pressure tracking
- Blood glucose tracking
- HRV tracking
- Readiness score
- Training load model
- Auto-generated training plans
- Injury risk detection
- Calendar-aware recommendations
- Weekly health review
- Monthly performance report
- Data import
- Data export
- Multi-user support
- Coach sharing
- Public profile
- Subscription billing
- Native mobile app
- Push notifications
- Offline mode
- Advanced charts
- GPS route maps
- GPX upload
- Full attachment upload and media library
- Wearable sync
- Fine-grained privacy controls

## 19. MVP Definition of Done

The MVP is complete when:

- The user can view Today with today's workout focus, active goals, recent context, quick logging, and the latest journal entry.
- The user can create, view, edit, and delete running logs.
- The user can create, view, edit, and delete strength training logs.
- The user can create, view, edit, and manage running routes.
- The user can create, view, edit, and manage goals.
- The user can create, view, edit, and delete journal entries.
- Goal progress is calculated for supported goal types.
- The UI is usable on desktop and mobile-width screens.
- Core data belongs to a user internally.
- The architecture leaves room for future modules without forcing current modules to be rewritten.

## 20. Key Architectural Reminder

The MVP should be small, but the boundaries should be intentional.

The right balance is:

- Keep the product scope narrow.
- Keep the module boundaries clear.
- Avoid premature infrastructure complexity.
- Avoid coupling Running, Strength, Routes, Goals, and Journal directly to each other.
- Let Today aggregate data through query services.
- Do not include future Health OS modules until the MVP is stable.
