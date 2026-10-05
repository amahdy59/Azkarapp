import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  // Note: sizes use min-h, never a fixed height. Arabic labels run longer than
  // their English counterparts and text can scale to 200%; a fixed height
  // clips wrapped labels. font-semibold matches the app's button convention
  // (docs/DESIGN_SYSTEM.md geometry and control contract).
  "inline-flex min-h-11 shrink-0 touch-manipulation items-center justify-center gap-2 rounded-xl text-center text-sm leading-normal font-semibold transition-[color,background-color,border-color,box-shadow,opacity] disabled:pointer-events-none disabled:opacity-50 [&_svg]:block [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 outline-none focus-visible:ring-ring focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive dark:bg-destructive/60",
        outline:
          "border border-border-control bg-background text-foreground hover:bg-muted hover:text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-11 px-4 py-2",
        sm: "min-h-11 gap-1.5 px-3 py-2",
        lg: "min-h-12 px-6 py-2",
        icon: "size-11 gap-0 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(function Button({ className, variant, size, asChild = false, ...props }, ref) {
  const Comp = asChild ? Slot : "button";

  return <Comp ref={ref} data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
});

export { Button, buttonVariants };
