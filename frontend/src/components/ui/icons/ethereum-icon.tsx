import { cn } from "@/lib/utils";
import type { HTMLMotionProps, Variants } from "motion/react";
import { motion, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

export interface EthereumIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface EthereumIconProps extends HTMLMotionProps<"div"> {
  size?: number;
  duration?: number;
  isAnimated?: boolean;
}

const EthereumIcon = forwardRef<EthereumIconHandle, EthereumIconProps>(
  (
    { onMouseEnter, onMouseLeave, className, size = 24, duration = 1, isAnimated = true, ...props },
    ref,
  ) => {
    const controls = useAnimation();
    const diamondControls = useAnimation();
    const reduced = useReducedMotion();
    const isControlled = useRef(false);

    useImperativeHandle(ref, () => {
      isControlled.current = true;
      return {
        startAnimation: () => {
          if (reduced) {
            controls.start("normal");
            diamondControls.start("normal");
          } else {
            controls.start("animate");
            diamondControls.start("animate");
          }
        },
        stopAnimation: () => {
          controls.start("normal");
          diamondControls.start("normal");
        },
      };
    });

    const handleEnter = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isAnimated || reduced) return;
        if (!isControlled.current) {
          controls.start("animate");
          diamondControls.start("animate");
        } else onMouseEnter?.(e as React.MouseEvent<HTMLDivElement>);
      },
      [controls, diamondControls, reduced, onMouseEnter, isAnimated],
    );

    const handleLeave = useCallback(
      (e?: React.MouseEvent<HTMLDivElement>) => {
        if (!isControlled.current) {
          controls.start("normal");
          diamondControls.start("normal");
        } else onMouseLeave?.(e as React.MouseEvent<HTMLDivElement>);
      },
      [controls, diamondControls, onMouseLeave],
    );

    const containerVariants: Variants = {
      normal: { scale: 1 },
      animate: {
        scale: [1, 1.06, 1],
        transition: { duration: 0.35 * duration, ease: "easeOut" },
      },
    };

    const diamondVariants: Variants = {
      normal: { y: 0, rotateY: 0 },
      animate: {
        y: [0, -2, 1, 0],
        rotateY: [0, 180, 360],
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
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          initial="normal"
          animate={diamondControls}
          variants={diamondVariants}
          style={{ transformStyle: "preserve-3d" }}
        >
          <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
        </motion.svg>
      </motion.div>
    );
  },
);

EthereumIcon.displayName = "EthereumIcon";
export { EthereumIcon };
