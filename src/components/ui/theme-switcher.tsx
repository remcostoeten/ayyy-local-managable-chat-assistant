'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Coffee, Database, Moon, Palette, Sun, ThermometerSun } from 'lucide-react';
import { useTheme } from 'next-themes';
import React from 'react';
import { For } from '@/shared/core/for';
import { useSidebar } from './sidebar';
import { Skeleton } from './skeleton';
import { toast } from 'sonner';

type TTheme = 'catpuccini' | 'supabase' | 'caffeine' | 'night-bourbon';

type TThemeItem = {
	key: TTheme;
	icon: LucideIcon;
	label: string;
	class: string;
};

const themes: Array<TThemeItem> = [
	{
		key: 'catpuccini',
		icon: Palette,
		label: 'Catpuccini theme',
		class: 'bg-background text-foreground',
	},
	{
		key: 'supabase',
		icon: Database,
		label: 'Supabase theme',
		class: 'bg-background text-foreground',
	},
	{
		key: 'caffeine',
		icon: Coffee,
		label: 'Caffeine theme',
		class: 'bg-background text-foreground',
	},
	{
		key: 'night-bourbon',
		icon: ThermometerSun,
		label: 'Night Bourbon theme',
		class: 'bg-background text-foreground',
	},
];

export function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();
	const { state, isMobile } = useSidebar();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<div className={cn('flex gap-2', !isMobile && state === 'collapsed' && 'flex-col')}>
				<div className="relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border">
					<For each={Array(4)} keyExtractor={(_, i) => i}>
						{() => <Skeleton className="h-6 w-6 rounded-full" />}
					</For>
				</div>
				<Skeleton className="h-8 w-8 rounded-full" />
			</div>
		);
	}

	const isDark = theme?.endsWith('-dark') ?? false;
	const currentThemeKey = (theme?.replace('-dark', '') || 'catpuccini') as TTheme;
	const isCollapsed = !isMobile && state === 'collapsed';

	const handleThemeChange = (newTheme: TTheme) => {
		const nextTheme = isDark ? `${newTheme}-dark` : newTheme;
		setTheme(nextTheme);
		document.documentElement.setAttribute('data-theme', nextTheme);

		// Show success toast with theme name and description
		toast.success(
			`Theme changed to ${newTheme}`,
		);
	};

	const handleDarkModeToggle = () => {
		const nextTheme = isDark ? currentThemeKey : `${currentThemeKey}-dark`;
		setTheme(nextTheme);
		document.documentElement.setAttribute('data-theme', nextTheme);

		// Show success toast for dark mode toggle
		toast.success(
			`${isDark ? 'Light' : 'Dark'} mode enabled`,
		);
	};

	return (
		<div className={cn('flex gap-2', isCollapsed && 'flex-col')}>
			<div className="relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border">
				<For<TThemeItem> each={themes} keyExtractor={(item) => item.key}>
					{(item) => {
						const isActive = currentThemeKey === item.key;
						const Icon = item.icon;
						return (
							<button
								type="button"
								className="relative h-6 w-6 rounded-full"
								onClick={() => handleThemeChange(item.key)}
								aria-label={item.label}
							>
								{isActive && (
									<motion.div
										layoutId="activeTheme"
										className="absolute inset-0 rounded-full bg-secondary"
										transition={{ type: 'spring', duration: 0.5 }}
									/>
								)}
								<Icon
									className={cn(
										'relative z-10 m-auto h-4 w-4',
										isActive ? 'text-foreground' : 'text-muted-foreground'
									)}
								/>
							</button>
						);
					}}
				</For>
			</div>
			<button
				onClick={handleDarkModeToggle}
				className="relative flex h-8 w-8 items-center justify-center rounded-full bg-background p-1 ring-1 ring-border"
				aria-label="Toggle dark mode"
			>
				<Sun
					className={cn(
						'h-4 w-4 transition-all',
						isDark ? 'scale-0 rotate-90' : 'scale-100 rotate-0'
					)}
				/>
				<Moon
					className={cn(
						'absolute h-4 w-4 transition-all',
						isDark ? 'scale-100 rotate-0' : 'scale-0 rotate-90'
					)}
				/>
			</button>
		</div>
	);
}
