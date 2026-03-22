import { cn } from "@/lib/utils";

type Props = { className?: string };

export function CdtLogo({ className }: Props) {
  return (
    <svg
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-emerald-600 dark:text-emerald-400", className)}
    >
      <circle cx="55" cy="55" r="52" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.07" />
      <circle cx="55" cy="55" r="42" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.14" />
      <circle cx="55" cy="55" r="32" fill="currentColor" opacity="0.09" />
      <circle cx="55" cy="55" r="32" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.28" />
      <ellipse cx="55" cy="41" rx="24" ry="15" fill="white" opacity="0.03" />
      <circle cx="55" cy="49" r="7.5" fill="currentColor" />
      <rect x="51" y="54" width="8" height="15" rx="4" fill="currentColor" />
    </svg>
  );
}
