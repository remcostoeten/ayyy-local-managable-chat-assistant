'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LogoIconProps {
	uniColor?: boolean;
}

const LogoIcon = ({ uniColor }: LogoIconProps) => {
	const pathVariants = {
		hidden: { pathLength: 0, opacity: 0 },
		visible: {
			pathLength: 1,
			opacity: 1,
			transition: {
				pathLength: { duration: 1.5, ease: [0.76, 0, 0.24, 1] },
				opacity: { duration: 0.3 },
			},
		},
	};

	const circleVariants = {
		hidden: { scale: 0, opacity: 0 },
		visible: {
			scale: 1,
			opacity: 1,
			transition: {
				duration: 0.5,
				ease: [0.76, 0, 0.24, 1],
			},
		},
	};

	const streamVariants = {
		hidden: { opacity: 0, y: 10 },
		visible: {
			opacity: 1,
			y: [10, -10],
			transition: {
				opacity: { duration: 0.3 },
				y: {
					duration: 2,
					repeat: Number.POSITIVE_INFINITY,
					repeatType: 'reverse' as const,
					ease: 'easeInOut',
				},
			},
		},
	};

	return (
		<motion.svg
			viewBox="0 0 32 32"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn('h-8 w-8', uniColor ? 'text-current' : 'text-foreground')}
			initial="hidden"
			animate="visible"
		>
			{/* Main hexagonal container with draw animation */}
			<motion.path
				d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
				className={cn(
					'stroke-foreground',
					uniColor ? 'fill-transparent stroke-current' : 'fill-background'
				)}
				strokeWidth="2.5"
				variants={pathVariants}
			/>

			{/* Animated data streams with staggered fade-in */}
			<motion.g
				variants={{
					hidden: { opacity: 0 },
					visible: {
						opacity: 1,
						transition: {
							delayChildren: 0.5,
							staggerChildren: 0.2,
						},
					},
				}}
			>
				<motion.path
					d="M8 18L16 22L24 18"
					className={cn('stroke-foreground', uniColor && 'stroke-current')}
					strokeWidth="2"
					strokeLinecap="round"
					variants={streamVariants}
				/>
				<motion.path
					d="M8 14L16 18L24 14"
					className={cn('stroke-foreground', uniColor && 'stroke-current')}
					strokeWidth="2"
					strokeLinecap="round"
					variants={streamVariants}
				/>
				<motion.path
					d="M8 10L16 14L24 10"
					className={cn('stroke-foreground', uniColor && 'stroke-current')}
					strokeWidth="2"
					strokeLinecap="round"
					variants={streamVariants}
				/>
			</motion.g>

			{/* Accent lines with delayed fade-in */}
			<motion.g
				variants={{
					hidden: { opacity: 0 },
					visible: {
						opacity: 1,
						transition: {
							delay: 1,
							duration: 0.5,
						},
					},
				}}
			>
				<motion.path
					d="M16 2V30"
					className={cn('stroke-foreground/60', uniColor && 'stroke-current/60')}
					strokeWidth="1.5"
					strokeDasharray="2 2"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1, delay: 1 }}
				/>
				<motion.path
					d="M4 9L28 9"
					className={cn('stroke-foreground/60', uniColor && 'stroke-current/60')}
					strokeWidth="1.5"
					strokeDasharray="2 2"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1, delay: 1.2 }}
				/>
				<motion.path
					d="M4 23L28 23"
					className={cn('stroke-foreground/60', uniColor && 'stroke-current/60')}
					strokeWidth="1.5"
					strokeDasharray="2 2"
					initial={{ pathLength: 0 }}
					animate={{ pathLength: 1 }}
					transition={{ duration: 1, delay: 1.4 }}
				/>
			</motion.g>

			{/* Highlight points with staggered pop-in */}
			<motion.g
				variants={{
					hidden: { opacity: 0 },
					visible: {
						opacity: 1,
						transition: {
							delayChildren: 1.5,
							staggerChildren: 0.1,
						},
					},
				}}
			>
				<motion.circle
					cx="16"
					cy="2"
					r="2"
					className={cn('fill-foreground', uniColor && 'fill-current')}
					variants={circleVariants}
				/>
				<motion.circle
					cx="28"
					cy="9"
					r="2"
					className={cn('fill-foreground', uniColor && 'fill-current')}
					variants={circleVariants}
				/>
				<motion.circle
					cx="28"
					cy="23"
					r="2"
					className={cn('fill-foreground', uniColor && 'fill-current')}
					variants={circleVariants}
				/>
				<motion.circle
					cx="16"
					cy="30"
					r="2"
					className={cn('fill-foreground', uniColor && 'fill-current')}
					variants={circleVariants}
				/>
				<motion.circle
					cx="4"
					cy="23"
					r="2"
					className={cn('fill-foreground', uniColor && 'fill-current')}
					variants={circleVariants}
				/>
				<motion.circle
					cx="4"
					cy="9"
					r="2"
					className={cn('fill-foreground', uniColor && 'fill-current')}
					variants={circleVariants}
				/>
			</motion.g>
		</motion.svg>
	);
};

interface LogoProps {
	className?: string;
	uniColor?: boolean;
}

export function Logo({ className, uniColor }: LogoProps) {
	return (
		<div className={cn('flex items-center justify-center', className)}>
			<motion.div
				className="group relative flex h-10 w-10 items-center justify-center"
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{
					duration: 0.3,
					ease: [0.76, 0, 0.24, 1],
				}}
			>
				<LogoIcon uniColor={uniColor} />
			</motion.div>
		</div>
	);
}
