export interface Habit {
  id: string;
  name: string;
  icon: string;
  colorHex: string;
  position: number;
  createdAt?: string;
}

export type CompletionsMap = Record<string, Set<string>>;

export const VIBRANT_PASTELS = [
  "#EE8172",
  "#F0A25D",
  "#E1C252",
  "#B3CE5B",
  "#7BC896",
  "#6CB8E6",
  "#DE8CE4",
  "#ED8CB1",
];

export const AVAILABLE_ICONS = [
  "drop.fill",
  "book.fill",
  "figure.run",
  "moon.fill",
  "sun.max.fill",
  "leaf.fill",
  "cup.and.saucer.fill",
  "dumbbell.fill",
  "heart.fill",
  "brain.head.profile",
  "flame.fill",
  "pencil.and.outline",
  "bed.double.fill",
  "fork.knife",
  "pills.fill",
  "laptopcomputer",
  "paintbrush.fill",
  "target",
  "bicycle",
  "cross.case.fill",
  "checkmark.seal.fill",
  "graduationcap.fill",
  "music.note",
  "camera.fill",
  "cart.fill",
  "wallet.pass.fill",
  "globe.europe.africa.fill",
  "tree.fill",
  "hourglass",
  "bubbles.and.sparkles.fill",
  "figure.walk",
  "figure.mind.and.body",
  "sparkles",
  "alarm.fill",
  "calendar",
  "list.bullet.clipboard.fill",
  "lightbulb.fill",
  "face.smiling.fill",
  "waveform.path.ecg",
  "trophy.fill"
];

// Mapping to FontAwesome6 / Ionicons / Lucide icons
export const ICON_NAME_MAP: Record<string, string> = {
  "drop.fill": "droplet",
  "book.fill": "book-open",
  "figure.run": "person-running",
  "moon.fill": "moon",
  "sun.max.fill": "sun",
  "leaf.fill": "leaf",
  "cup.and.saucer.fill": "mug-hot",
  "dumbbell.fill": "dumbbell",
  "heart.fill": "heart",
  "brain.head.profile": "brain",
  "flame.fill": "fire",
  "pencil.and.outline": "pen",
  "bed.double.fill": "bed",
  "fork.knife": "utensils",
  "pills.fill": "pills",
  "laptopcomputer": "laptop",
  "paintbrush.fill": "paint-brush",
  "target": "bullseye",
  "bicycle": "bicycle",
  "cross.case.fill": "kit-medical",
  "checkmark.seal.fill": "certificate",
  "graduationcap.fill": "graduation-cap",
  "music.note": "music",
  "camera.fill": "camera",
  "cart.fill": "shopping-cart",
  "wallet.pass.fill": "receipt",
  "globe.europe.africa.fill": "globe",
  "tree.fill": "tree",
  "hourglass": "hourglass",
  "bubbles.and.sparkles.fill": "wand-magic-sparkles",
  "figure.walk": "person-walking",
  "figure.mind.and.body": "spa",
  "sparkles": "wand-magic-sparkles",
  "alarm.fill": "bell",
  "calendar": "calendar-days",
  "list.bullet.clipboard.fill": "clipboard-list",
  "lightbulb.fill": "lightbulb",
  "face.smiling.fill": "face-smile",
  "waveform.path.ecg": "heart-pulse",
  "trophy.fill": "trophy"
};
