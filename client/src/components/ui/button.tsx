import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#DC0037] text-white hover:bg-white hover:text-[#DC0037] hover:border hover:border-[#DC0037] active:bg-[#F5F5F5]",
        secondary: "bg-white text-[#DC0037] border border-[#DC0037] hover:bg-[#DC0037] hover:text-white active:bg-[#B30027]",
        tertiary: "bg-transparent text-[#DC0037] hover:bg-white hover:text-[#DC0037] hover:border hover:border-[#DC0037] active:bg-[#F5F5F5]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-white hover:text-destructive hover:border hover:border-destructive",
        ghost: "hover:bg-white hover:text-[#DC0037] hover:border hover:border-[#DC0037]",
        link: "text-[#DC0037] underline-offset-4 hover:text-[#B30027]",
      },
      size: {
        default: "h-10 sm:h-11 px-4 py-2 min-w-[44px] sm:min-w-[64px]",
        sm: "h-9 sm:h-10 rounded-md px-3 min-w-[36px] sm:min-w-[48px]",
        lg: "h-11 sm:h-12 rounded-md px-6 sm:px-8 min-w-[64px] sm:min-w-[88px]",
        icon: "h-10 w-10 sm:h-11 sm:w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }