"use client";
import { motion } from "motion/react";

export function Underline() {
	return (
		<motion.div
			className="absolute inset-x-0 -bottom-1 h-0.5 translate-y-0.5 bg-primary"
			key="underline"
			layout
			layoutId="underline"
		/>
	);
}
