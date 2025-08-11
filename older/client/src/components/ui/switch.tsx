import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, onCheckedChange, checked, ...props }, ref) => {
  
  // Logs extensivos do Switch
  console.log("🎛️🎛️🎛️ SWITCH RENDER 🎛️🎛️🎛️");
  console.log("🎛️ Checked prop:", checked);
  console.log("🎛️ OnCheckedChange:", typeof onCheckedChange);
  console.log("🎛️ Props:", props);
  console.log("🎛️ Timestamp:", Date.now());
  
  const handleCheckedChange = (newChecked: boolean) => {
    console.log("🎛️🎛️🎛️ SWITCH CHANGE EVENTO 🎛️🎛️🎛️");
    console.log("🎛️ Valor anterior:", checked);
    console.log("🎛️ Novo valor:", newChecked);
    console.log("🎛️ onCheckedChange existe?", !!onCheckedChange);
    console.log("🎛️ Timestamp:", Date.now());
    
    if (onCheckedChange) {
      console.log("🎛️ Chamando onCheckedChange...");
      onCheckedChange(newChecked);
      console.log("🎛️ onCheckedChange executado");
    } else {
      console.log("🎛️ ⚠️ onCheckedChange não definido!");
    }
  };

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      checked={checked}
      onCheckedChange={handleCheckedChange}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
