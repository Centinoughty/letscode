const LANGUAGES = [
  { label: "python", value: "py" },
  { label: "cpp", value: "cpp" },
  { label: "c", value: "c" },
];

type Language = (typeof LANGUAGES)[number]["value"];
