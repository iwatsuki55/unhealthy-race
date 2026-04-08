export const ageGroupOptions = [
  { value: "30s", label: "30代" },
  { value: "40s", label: "40代" },
  { value: "50s", label: "50代" },
  { value: "60_plus", label: "60代以上" },
] as const;

export const genderOptions = [
  { value: "female", label: "女性" },
  { value: "male", label: "男性" },
  { value: "other", label: "その他" },
  { value: "no_answer", label: "回答しない" },
] as const;

export type ProfileFormState = {
  error: string | null;
};

