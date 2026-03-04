import { cn } from "@/lib/utils";
import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface FingerprintIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface FingerprintIconProps extends HTMLMotionProps<"div"> {
  size?: number;
  duration?: number;
  isAnimated?: boolean;
}

const FingerprintIcon = forwardRef<FingerprintIconHandle, FingerprintIconProps>(
  (
    { onMouseEnter, onMouseLeave, className, size = 24, duration = 1, isAnimated = true, ...props },
    ref,
  ) => {
    const controls = useAnimation();
    const scanControls = useAnimation();
    const reduced = useReducedMotion();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => {
          if (reduced) {
            controls.start("normal");
            scanControls.start("normal");
          } else {
            controls.start("animate");
            scanControls.start("animate");
          }
        },
        stopAnimation: () => {
          controls.start("normal");
          scanControls.start("normal");
        },
      };
    });

    const handleEnter = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isAnimated || reduced) return;
        if (!isControlled.current) {
          controls.start("animate");
          scanControls.start("animate");
        } else onMouseEnter?.(e as React.MouseEvent<HTMLDivElement>);
      },
      [controls, scanControls, reduced, onMouseEnter, isAnimated],
    );

    const handleLeave = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlled.current) {
          controls.start("normal");
          scanControls.start("normal");
        } else onMouseLeave?.(e as React.MouseEvent<HTMLDivElement>);
      },
      [controls, scanControls, onMouseLeave],
    );

    const containerVariants: Variants = {
      normal: { scale: 1 },
      animate: {
        scale: [1, 1.08, 0.97, 1],
        transition: { duration: 0.4 * duration, ease: "easeOut" },
      },
    };

    const scanVariants: Variants = {
      normal: { opacity: 1, pathLength: 1 },
      animate: {
        opacity: [1, 0.5, 1],
        pathLength: [1, 0.6, 1],
        transition: {
          duration: 0.6 * duration,
          ease: "easeInOut",
        },
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
        variants={containerVariants}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
            initial="normal"
            animate={scanControls}
            variants={scanVariants}
          />
        </svg>
      </motion.div>
    );
  },
);

FingerprintIcon.displayName = "FingerprintIcon";
export { FingerprintIcon };
