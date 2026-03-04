import { cn } from "@/lib/utils";
import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface TelegramIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface TelegramIconProps extends HTMLMotionProps<"div"> {
  size?: number;
  duration?: number;
  isAnimated?: boolean;
}

const TelegramIcon = forwardRef<TelegramIconHandle, TelegramIconProps>(
  (
    { onMouseEnter, onMouseLeave, className, size = 24, duration = 1, isAnimated = true, ...props },
    ref,
  ) => {
    const controls = useAnimation();
    const planeControls = useAnimation();
    const reduced = useReducedMotion();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => {
          if (reduced) {
            controls.start("normal");
            planeControls.start("normal");
          } else {
            controls.start("animate");
            planeControls.start("animate");
          }
        },
        stopAnimation: () => {
          controls.start("normal");
          planeControls.start("normal");
        },
      };
    });

    const handleEnter = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isAnimated || reduced) return;
        if (!isControlled.current) {
          controls.start("animate");
          planeControls.start("animate");
        } else onMouseEnter?.(e as React.MouseEvent<HTMLDivElement>);
      },
      [controls, planeControls, reduced, onMouseEnter, isAnimated],
    );

    const handleLeave = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlled.current) {
          controls.start("normal");
          planeControls.start("normal");
        } else onMouseLeave?.(e as React.MouseEvent<HTMLDivElement>);
      },
      [controls, planeControls, onMouseLeave],
    );

    const containerVariants: Variants = {
      normal: { scale: 1 },
      animate: {
        scale: [1, 1.06, 1],
        transition: { duration: 0.3 * duration, ease: "easeOut" },
      },
    };

    const planeVariants: Variants = {
      normal: { x: 0, y: 0, rotate: 0 },
      animate: {
        x: [0, 3, -1, 0],
        y: [0, -2, 1, 0],
        rotate: [0, -6, 2, 0],
        transition: {
          duration: 0.5 * duration,
          ease: "easeOut",
          times: [0, 0.4, 0.75, 1],
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
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          initial="normal"
          animate={planeControls}
          variants={planeVariants}
        >
          <path d="M21.59 2.41c-.52-.41-1.26-.53-1.9-.3L2.97 8.27c-.83.31-1.03 1.42-.36 2.01l4.6 4.04 10.36-7.22-7.75 8.52.02 5.64c0 .59.64.94 1.13.61l3.42-2.34 4.41 3.24c.72.53 1.75.14 1.95-.73l2.9-17.8c.13-.73-.15-1.46-.75-1.93z" />
        </motion.svg>
      </motion.div>
    );
  },
);

TelegramIcon.displayName = "TelegramIcon";
export { TelegramIcon };
