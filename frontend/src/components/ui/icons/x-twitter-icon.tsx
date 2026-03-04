import { cn } from "@/lib/utils";
import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface XTwitterIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface XTwitterIconProps extends HTMLMotionProps<"div"> {
  size?: number;
  duration?: number;
  isAnimated?: boolean;
}

const XTwitterIcon = forwardRef<XTwitterIconHandle, XTwitterIconProps>(
  (
    { onMouseEnter, onMouseLeave, className, size = 24, duration = 1, isAnimated = true, ...props },
    ref,
  ) => {
    const controls = useAnimation();
    const reduced = useReducedMotion();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => controls.start(reduced ? "normal" : "animate"),
        stopAnimation: () => controls.start("normal"),
      };
    });

    const handleEnter = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isAnimated || reduced) return;
        if (!isControlled.current) controls.start("animate");
        else onMouseEnter?.(e as React.MouseEvent<HTMLDivElement>);
      },
      [controls, reduced, onMouseEnter, isAnimated],
    );

    const handleLeave = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlled.current) controls.start("normal");
        else onMouseLeave?.(e as React.MouseEvent<HTMLDivElement>);
      },
      [controls, onMouseLeave],
    );

    const variants: Variants = {
      normal: { rotate: 0, scale: 1 },
      animate: {
        rotate: [0, -8, 6, 0],
        scale: [1, 1.1, 0.95, 1],
        transition: { duration: 0.5 * duration, ease: "easeOut" },
      },
    };

    return (
      <motion.div
        className={cn("inline-flex items-center justify-center", className)}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        {...props}
        initial="normal"
        animate={controls}
        variants={variants}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </motion.div>
    );
  },
);

XTwitterIcon.displayName = "XTwitterIcon";
export { XTwitterIcon };
