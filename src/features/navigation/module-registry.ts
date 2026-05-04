export type PMModule = {
  href: string;
  label: string;
  shortLabel: string;
  description: string;
  status: "Live" | "New";
};

export const PM_MODULES: PMModule[] = [
  {
    href: "/projects",
    label: "Projects",
    shortLabel: "Projects",
    description: "Create and manage your project workspaces.",
    status: "Live",
  },
  {
    href: "/upload",
    label: "Upload",
    shortLabel: "Upload",
    description: "Upload documents and run production analyses.",
    status: "Live",
  },
];
