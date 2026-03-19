// ─────────────────────────────────────────────────────────────
// WORKOUT CONFIGURATION
// Add / edit exercises here. No in-app UI needed.
//
// exercise fields:
//   key          – unique string id, used as FK in Supabase
//   name         – display name
//   photoUrl     – remote image (can be null)
//   videoUrl     – YouTube link (can be null)
//   defaultSets  – number of sets shown on first use
//   defaultReps  – number of reps shown on first use
//   defaultWeight – starting weight in kg
//
// workout day fields:
//   key      – unique string id
//   name     – display title
//   subtitle – optional tagline shown under the title (new plan only)
// ─────────────────────────────────────────────────────────────

// ── CHRIS: NEW PLAN ──────────────────────────────────────────

export const CHRIS_NEW_PLAN = [
  {
    key: 'new_push_day',
    name: 'Push Day',
    subtitle: 'Chest / Shoulders / Triceps',
    exercises: [
      { key: 'new_bench_press',              name: 'Bench Press',               photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 7,  defaultWeight: 60 },
      { key: 'new_incline_dumbbell_press',   name: 'Incline Dumbbell Press',    photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 9,  defaultWeight: 20 },
      { key: 'new_seated_shoulder_press',    name: 'Seated Shoulder Press',     photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 9,  defaultWeight: 20 },
      { key: 'new_lateral_raises_push',      name: 'Lateral Raises',            photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 13, defaultWeight: 10 },
      { key: 'new_triceps_pushdown',         name: 'Triceps Pushdown',          photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 11, defaultWeight: 25 },
      { key: 'new_overhead_triceps_ext',     name: 'Overhead Triceps Extension',photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 11, defaultWeight: 20 },
      { key: 'new_plank_push',               name: 'Plank',                     photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 60, defaultWeight: 0,  type: 'plank' },
    ],
  },
  {
    key: 'new_pull_day',
    name: 'Pull Day',
    subtitle: 'Back / Biceps',
    exercises: [
      { key: 'new_pullup_lat_pulldown',      name: 'Pull-ups / Lat Pulldown',   photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 8,  defaultWeight: 0  },
      { key: 'new_seated_row',               name: 'Seated Row',                photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 10, defaultWeight: 40 },
      { key: 'new_chest_supported_row',      name: 'Chest Supported Row',       photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 30 },
      { key: 'new_face_pulls_pull',          name: 'Face Pulls',                photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 15, defaultWeight: 15 },
      { key: 'new_barbell_curl_pull',        name: 'Barbell Curl',              photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 9,  defaultWeight: 30 },
      { key: 'new_hammer_curl_pull',         name: 'Hammer Curl',               photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 11, defaultWeight: 12 },
      { key: 'new_hanging_leg_raises',       name: 'Hanging Leg Raises',        photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 12, defaultWeight: 0  },
    ],
  },
  {
    key: 'new_upper_hypertrophy',
    name: 'Upper Hypertrophy Day',
    subtitle: 'Chest / Back / Arms',
    exercises: [
      { key: 'new_incline_bench',            name: 'Incline Bench',             photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 9,  defaultWeight: 50 },
      { key: 'new_cable_fly',                name: 'Cable Fly',                 photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 13, defaultWeight: 15 },
      { key: 'new_lat_pulldown_hyp',         name: 'Lat Pulldown',              photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 10, defaultWeight: 50 },
      { key: 'new_single_arm_db_row',        name: 'Single Arm Dumbbell Row',   photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 20 },
      { key: 'new_ez_bar_curl',              name: 'EZ Bar Curl',               photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 25 },
      { key: 'new_rope_pushdown',            name: 'Rope Pushdown',             photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 11, defaultWeight: 20 },
      { key: 'new_rear_delt_fly_hyp',        name: 'Rear Delt Fly',             photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 15, defaultWeight: 8  },
    ],
  },
  {
    key: 'new_arms_shoulders',
    name: 'Arms & Shoulders Day',
    subtitle: 'Very effective for fast visual changes',
    exercises: [
      { key: 'new_barbell_curl_arms',        name: 'Barbell Curl',              photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 9,  defaultWeight: 30 },
      { key: 'new_incline_db_curl',          name: 'Incline Dumbbell Curl',     photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 12 },
      { key: 'new_hammer_curl_arms',         name: 'Hammer Curl',               photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 12, defaultWeight: 12 },
      { key: 'new_close_grip_bench',         name: 'Close Grip Bench Press',    photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 7,  defaultWeight: 50 },
      { key: 'new_skull_crushers',           name: 'Skull Crushers',            photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 20 },
      { key: 'new_cable_triceps_pushdown',   name: 'Cable Triceps Pushdown',    photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
      { key: 'new_lateral_raises_arms',      name: 'Lateral Raises',            photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 15, defaultWeight: 10 },
      { key: 'new_cable_crunch',             name: 'Cable Crunch',              photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
    ],
  },
  {
    key: 'new_legs_optional',
    name: 'Knee-Safe Leg Work',
    subtitle: 'Optional — just maintain balance',
    exercises: [
      { key: 'new_glute_bridge',             name: 'Glute Bridge',              photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 0  },
      { key: 'new_hamstring_curl',           name: 'Hamstring Curl Machine',    photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 12, defaultWeight: 20 },
      { key: 'new_calf_raises_legs',         name: 'Calf Raises',               photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 15, defaultWeight: 0  },
    ],
  },
]

// ── CHRIS: OLD PLAN ──────────────────────────────────────────

export const CHRIS_OLD_PLAN = [
  {
    key: 'old_cardio',
    name: 'Cardio Day',
    exercises: [
      { key: 'old_spinning',                 name: '45-min Spinning Class',     photoUrl: null, videoUrl: null, defaultSets: 1, defaultReps: 90, defaultWeight: 20, type: 'cycling' },
      { key: 'old_run',                      name: '30-min High-Intensity Run', photoUrl: null, videoUrl: null, defaultSets: 1, defaultReps: 60, defaultWeight: 5,  type: 'run' },
    ],
  },
  {
    key: 'old_chest_triceps',
    name: 'Chest and Triceps',
    exercises: [
      { key: 'old_bench_press',              name: 'Bench Press',               photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 10, defaultWeight: 60 },
      { key: 'old_incline_db_press',         name: 'Incline Dumbbell Press',    photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 20 },
      { key: 'old_cable_flyes',              name: 'Cable Flyes',               photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 13, defaultWeight: 15 },
      { key: 'old_tricep_dips',              name: 'Tricep Dips',               photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 12, defaultWeight: 0  },
      { key: 'old_overhead_tricep_ext',      name: 'Overhead Tricep Extension', photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 13, defaultWeight: 20 },
      { key: 'old_tricep_pushdowns',         name: 'Tricep Pushdowns',          photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 13, defaultWeight: 25 },
    ],
  },
  {
    key: 'old_back_biceps',
    name: 'Back and Biceps',
    exercises: [
      { key: 'old_pullups_lat_pulldown',     name: 'Pull-Ups / Lat Pulldowns',  photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 10, defaultWeight: 0  },
      { key: 'old_bent_over_rows',           name: 'Bent Over Rows',            photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 40 },
      { key: 'old_seated_cable_rows',        name: 'Seated Cable Rows',         photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 13, defaultWeight: 40 },
      { key: 'old_face_pulls',               name: 'Face Pulls',                photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 15, defaultWeight: 15 },
      { key: 'old_bicep_curls',              name: 'Bicep Curls',               photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 13, defaultWeight: 25 },
      { key: 'old_hammer_curls',             name: 'Hammer Curls',              photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 13, defaultWeight: 12 },
    ],
  },
  {
    key: 'old_shoulders_core',
    name: 'Shoulders and Core',
    exercises: [
      { key: 'old_shoulder_press',           name: 'Shoulder Press',            photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 10, defaultWeight: 20 },
      { key: 'old_lateral_raises',           name: 'Lateral Raises',            photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 13, defaultWeight: 10 },
      { key: 'old_front_raises',             name: 'Front Raises',              photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 13, defaultWeight: 10 },
      { key: 'old_rear_delt_flyes',          name: 'Rear Delt Flyes',           photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 15, defaultWeight: 8  },
      { key: 'old_plank',                    name: 'Plank',                     photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 60, defaultWeight: 0,  type: 'plank' },
      { key: 'old_russian_twists',           name: 'Russian Twists',            photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 20, defaultWeight: 0  },
      { key: 'old_leg_raises',               name: 'Leg Raises',                photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 15, defaultWeight: 0  },
    ],
  },
  {
    key: 'old_full_body',
    name: 'Full Body',
    exercises: [
      { key: 'old_db_bench_press',           name: 'Dumbbell Bench Press',      photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 20 },
      { key: 'old_db_rows',                  name: 'Dumbbell Rows',             photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 20 },
      { key: 'old_db_shoulder_press',        name: 'Dumbbell Shoulder Press',   photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 15 },
      { key: 'old_db_curls',                 name: 'Dumbbell Curls',            photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 13, defaultWeight: 12 },
      { key: 'old_tricep_kickbacks',         name: 'Tricep Kickbacks',          photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 13, defaultWeight: 10 },
      { key: 'old_bw_squats',                name: 'Bodyweight Squats',         photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 17, defaultWeight: 0  },
      { key: 'old_ab_wheel',                 name: 'Ab Wheel Rollouts',         photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 0  },
    ],
  },
]

// ── KÁŤA: WORKOUT DAYS ───────────────────────────────────────

export const KATA_WORKOUT_DAYS = [
  {
    key: 'chest_triceps',
    name: 'Chest & Triceps',
    exercises: [
      { key: 'bench_press',          name: 'Bench Press',          photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 60 },
      { key: 'incline_dumbbell_press', name: 'Incline Dumbbell Press', photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 20 },
      { key: 'tricep_pushdown',      name: 'Tricep Pushdown',      photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 12, defaultWeight: 25 },
    ],
  },
  {
    key: 'back_biceps',
    name: 'Back & Biceps',
    exercises: [
      { key: 'deadlift',    name: 'Deadlift',  photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 8,  defaultWeight: 80 },
      { key: 'pull_up',     name: 'Pull-Up',   photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 8,  defaultWeight: 0  },
      { key: 'barbell_curl', name: 'Barbell Curl', photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 10, defaultWeight: 30 },
    ],
  },
  {
    key: 'legs',
    name: 'Leg Day',
    exercises: [
      { key: 'squat',      name: 'Squat',      photoUrl: null, videoUrl: null, defaultSets: 4, defaultReps: 8,  defaultWeight: 80  },
      { key: 'leg_press',  name: 'Leg Press',  photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 12, defaultWeight: 100 },
      { key: 'calf_raise', name: 'Calf Raise', photoUrl: null, videoUrl: null, defaultSets: 3, defaultReps: 15, defaultWeight: 40  },
    ],
  },
  {
    key: 'cardio',
    name: 'Cardio',
    exercises: [
      { key: 'treadmill', name: 'Treadmill', photoUrl: null, videoUrl: null, defaultSets: 1, defaultReps: 60, defaultWeight: 5, type: 'run' },
    ],
  },
]

// ── WARM-UP OPTIONS ──────────────────────────────────────────

export const WARMUP_OPTIONS = [
  { key: 'warmup_run',         name: 'Outdoor Run',     type: 'run',     defaultSets: 1, defaultReps: 60,   defaultWeight: 5,  photoUrl: null, videoUrl: null },
  { key: 'warmup_spinning',    name: 'Spinning',        type: 'cycling', defaultSets: 1, defaultReps: 90,   defaultWeight: 20, photoUrl: null, videoUrl: null },
  { key: 'warmup_rowing',      name: 'Rowing Machine',  type: 'run',     defaultSets: 1, defaultReps: 40,   defaultWeight: 2,  photoUrl: null, videoUrl: null },
  { key: 'warmup_walking',     name: 'Walking',         type: 'run',     defaultSets: 1, defaultReps: 60,   defaultWeight: 3,  photoUrl: null, videoUrl: null },
  { key: 'warmup_swimming',    name: 'Swimming',        type: 'run',     defaultSets: 1, defaultReps: 40,   defaultWeight: 1,  photoUrl: null, videoUrl: null },
  { key: 'warmup_jumprope',    name: 'Jump Rope',       type: 'plank',   defaultSets: 3, defaultReps: 120,  defaultWeight: 0,  photoUrl: null, videoUrl: null },
  { key: 'warmup_elliptical',  name: 'Elliptical',      type: 'plank',   defaultSets: 1, defaultReps: 1200, defaultWeight: 0,  photoUrl: null, videoUrl: null },
  { key: 'warmup_stairmaster', name: 'Stair Master',    type: 'plank',   defaultSets: 1, defaultReps: 600,  defaultWeight: 0,  photoUrl: null, videoUrl: null },
]

// ── Helper ────────────────────────────────────────────────────

export function getWorkoutDays(profileName, plan) {
  if (profileName === 'Chris') {
    return plan === 'new' ? CHRIS_NEW_PLAN : CHRIS_OLD_PLAN
  }
  return KATA_WORKOUT_DAYS
}

export function findWorkout(profileName, plan, workoutKey) {
  return getWorkoutDays(profileName, plan).find((w) => w.key === workoutKey) ?? null
}

// Search across ALL plans — used by history screen where we only have a key
export function findWorkoutByKey(workoutKey) {
  const all = [...CHRIS_NEW_PLAN, ...CHRIS_OLD_PLAN, ...KATA_WORKOUT_DAYS]
  return all.find((w) => w.key === workoutKey) ?? null
}

export function findWarmupByKey(workoutKey) {
  return WARMUP_OPTIONS.find((w) => w.key === workoutKey) ?? null
}

// Returns every exercise across all plans — automatically includes future additions
export function getAllExercises() {
  const seen = new Set()
  const result = []
  for (const day of [...CHRIS_NEW_PLAN, ...CHRIS_OLD_PLAN, ...KATA_WORKOUT_DAYS]) {
    for (const ex of day.exercises) {
      if (!seen.has(ex.key)) { seen.add(ex.key); result.push(ex) }
    }
  }
  for (const ex of WARMUP_OPTIONS) {
    if (!seen.has(ex.key)) { seen.add(ex.key); result.push(ex) }
  }
  return result
}

export function findExerciseByKey(key) {
  return getAllExercises().find((ex) => ex.key === key) ?? null
}
