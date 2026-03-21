"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => {
  const [checked, setInternalChecked] = React.useState(
    props.checked ?? props.defaultChecked ?? false
  );
  React.useEffect(() => {
    if (props.checked !== undefined) setInternalChecked(props.checked);
  }, [props.checked]);

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-[26px] w-[44px] shrink-0 cursor-pointer items-center rounded-full transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-emerald-500",
        className
      )}
      data-glass={!checked ? "toggle-track" : undefined}
      onCheckedChange={(val) => {
        setInternalChecked(val);
        props.onCheckedChange?.(val);
      }}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-[22px] w-[22px] rounded-full transition-transform",
          "data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-[2px]",
          "data-[state=checked]:bg-white data-[state=checked]:shadow-sm",
        )}
        data-glass={!checked ? "toggle-thumb" : undefined}
      />
    </SwitchPrimitives.Root>
  );
});
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
