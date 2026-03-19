# Workout App

A personal workout tracking PWA built with React Native + Expo, deployed to GitHub Pages and used as a home-screen app on iPhone.

## Features

- **Multi-profile support** — Chris (New Plan / Old Plan) and Káťa, each with their own workout history
- **Warm-up flow** — optional warm-up selection before every workout, with "don't ask again" memory
- **Active workout screen** — exercise cards with sets × reps × weight logging, rest timer, YouTube tutorial links, skip/complete tracking
- **Workout history** — calendar view with per-day drill-down, expandable exercise logs, edit and delete entries
- **Statistics screen** — summary cards (total workouts, this month, current streak, best streak), weekly activity chart, per-exercise progress chart (Simple: kg over time / Advanced: kg · reps · volume + full session log), training volume chart
- **Rest timer** — configurable duration between sets, persisted per profile
- **Dark / light mode** — follows system preference automatically
- **PWA** — installable on iPhone via Safari → Add to Home Screen, works offline

## Tech Stack

- React Native + Expo SDK 54 (web export)
- React Navigation (native stack)
- Supabase (PostgreSQL) — stores workout history and exercise settings per profile
- AsyncStorage — stores active profile and user preferences locally
- react-native-svg — SVG line charts in the Statistics screen
- GitHub Pages — hosting via `gh-pages`

## Project Structure

```
src/
  screens/
    SplashScreen.js          # Entry point — greeting + profile detection
    WarmupQuestionScreen.js  # Ask to warm up before workout
    WarmupSelectScreen.js    # Choose warm-up exercise
    WarmupActiveScreen.js    # Log the warm-up
    ProfileSelectScreen.js   # Choose who is working out
    PlanSelectScreen.js      # Chris: choose New or Old plan
    WorkoutListScreen.js     # List of workout days for the selected plan
    ActiveWorkoutScreen.js   # Live workout — exercise cards, rest timer
    HistoryScreen.js         # Calendar + workout history log
    StatsScreen.js           # Charts and progress statistics
  components/
    ExerciseCard.js          # Exercise input card (weight, reps, sets, cardio, plank)
    RestTimer.js             # Countdown timer overlay
    RestTimerSetting.js      # Rest duration setting widget
    WarmupSetting.js         # Re-enable warm-up prompt widget
  data/
    workoutsData.js          # All workout plans, exercises, warm-up options + helpers
    workoutImages.js         # Auto-generated exercise image map
  hooks/
    useProfileId.js          # Resolves profile name → Supabase profile ID
  lib/
    supabase.js              # Supabase client
    theme.js                 # Light / dark colour tokens
  navigation/
    AppNavigator.js          # Stack navigator — all screens registered here
scripts/
  generate-image-map.js      # Pre-build: scans assets/Workout Images/ → workoutImages.js
  post-export.js             # Post-build: patches index.html, injects SW, copies icons
sw-template.js               # Service worker template (cache + offline support)
```

## Supabase Schema

```sql
-- Profiles
profiles (id uuid, name text)

-- Per-exercise settings (sets / reps / weight), upserted on every change
exercise_settings (profile_id uuid, exercise_key text, sets int, reps int, weight_kg float)

-- Workout log entries
workout_history (id uuid, profile_id uuid, workout_key text, completed_at timestamptz, notes jsonb)
-- notes shape: { exercises: [...], incomplete?: true, is_warmup?: true }
```

## Adding New Workouts

1. Open `src/data/workoutsData.js`
2. Add a new workout day object (with `key`, `name`, `subtitle`, `exercises[]`) to the relevant plan array (`CHRIS_NEW_PLAN`, `CHRIS_OLD_PLAN`, or `KATA_WORKOUT_DAYS`)
3. Each exercise needs: `key` (unique), `name`, `defaultSets`, `defaultReps`, `defaultWeight`, optionally `type` (`'run'` | `'cycling'` | `'plank'` for cardio/duration exercises)
4. The new workout will automatically appear in the workout list, history, and statistics — no other changes needed

## Deploy

```bash
npm run deploy
```

This runs: image map generation → `expo export --platform web` → post-build patching → `gh-pages` publish.
