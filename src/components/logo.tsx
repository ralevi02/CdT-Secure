type LogoProps = {
  size?: number;
  color?: string;
  className?: string;
};

export function Logo({ size = 24, color = "#22C55E", className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 110 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="55" cy="55" r="52" stroke={color} strokeWidth="1.5" fill="none" opacity="0.07" />
      <circle cx="55" cy="55" r="42" stroke={color} strokeWidth="2" fill="none" opacity="0.14" />
      <circle cx="55" cy="55" r="32" fill={color} opacity="0.09" />
      <circle cx="55" cy="55" r="32" stroke={color} strokeWidth="2.5" fill="none" opacity="0.28" />
      <ellipse cx="55" cy="41" rx="24" ry="15" fill="white" opacity="0.03" />
      <circle cx="55" cy="49" r="7.5" fill={color} />
      <rect x="51" y="54" width="8" height="15" rx="4" fill={color} />
    </svg>
  );
}
