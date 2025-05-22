'use client';

/**
 * @description: 'A utility component for rendering lists of items in React. It allows for flexible rendering of each item, including optional wrappers, loading states, and empty fallbacks.'
 * @author: 'Remco Stoeten'
 */

import {
	type ElementType,
	Fragment,
	type ReactNode,
	createElement,
	memo,
	useCallback,
	useMemo,
} from 'react';

/**
 * @template T The type of the items in the list.
 * @typedef {object} TProps
 * @property {T[]} each - The array of items to iterate over.
 * @property {(item: T, index: number) => ReactNode} children - A function that receives an item and its index and returns a ReactNode to render for that item.
 * @property {ElementType} [as=Fragment] - The HTML element or React component to wrap the list in. Defaults to Fragment.
 * @property {string} [role='list'] - The ARIA role for the wrapping element. Defaults to 'list'.
 * @property {string} [className=''] - The CSS class name for the wrapping element.
 * @property {string} [id] - The ID for the wrapping element.
 * @property {string} [ariaLabel] - The ARIA label for the wrapping element.
 * @property {(item: T, index: number) => string | number} [keyExtractor=(_, i) => i] - A function to extract a unique key for each item. Defaults to using the index.
 * @property {Record<string, unknown>} [props={}] - Additional props to pass to the wrapping element.
 * @property {(node: ReactNode, item: T, index: number) => ReactNode} [itemWrapper] - An optional function to wrap the rendered node of each item.
 * @property {boolean} [memoizeChildren=false] - Whether to memoize the rendering of each child item using React.memo.
 * @property {ReactNode} [emptyFallback=null] - The content to render when the `each` array is empty.
 * @property {boolean} [isLoading=false] - Whether the list is currently loading.
 * @property {ReactNode} [loadingFallback=null] - The content to render when `isLoading` is true.
 */

/**
 * A utility component for rendering lists of items in React with flexible rendering options.
 *
 * @template T The type of the items in the list.
 * @param {TProps<T>} props - The component's props.
 * @returns {ReactNode} The rendered list or fallback content.
 */

type TProps<T> = {
	each: T[];
	children: (item: T, index: number) => ReactNode;
	as?: ElementType;
	role?: string;
	className?: string;
	id?: string;
	ariaLabel?: string;
	keyExtractor?: (item: T, index: number) => string | number;
	props?: Record<string, unknown>;
	itemWrapper?: (node: ReactNode, item: T, index: number) => ReactNode;
	memoizeChildren?: boolean;
	emptyFallback?: ReactNode;
	isLoading?: boolean;
	loadingFallback?: ReactNode;
};

export function For<T>(props: TProps<T>): ReactNode {
	const {
		each,
		children,
		as: Component = Fragment,
		role = 'list',
		className = '',
		id,
		ariaLabel,
		keyExtractor = (_, i) => i,
		props: restProps = {},
		itemWrapper,
		memoizeChildren = false,
		emptyFallback = null,
		isLoading = false,
		loadingFallback = null,
	} = props;

	const renderItem = useCallback(
		(item: T, index: number) => {
			const key = keyExtractor(item, index);
			let node = children(item, index);
			if (itemWrapper) node = itemWrapper(node, item, index);
			return <Fragment key={key}>{node}</Fragment>;
		},
		[keyExtractor, children, itemWrapper]
	);

	const MemoizedItem = useMemo(
		() => memo((props: { item: T; index: number }) => renderItem(props.item, props.index)),
		[renderItem]
	);

	const mapped = useMemo(() => {
		return each.map((item, index) =>
			memoizeChildren ? (
				<MemoizedItem key={keyExtractor(item, index)} item={item} index={index} />
			) : (
				renderItem(item, index)
			)
		);
	}, [each, memoizeChildren, keyExtractor, renderItem, MemoizedItem]);

	if (isLoading) {
		return loadingFallback;
	}

	if (!each || each.length === 0) {
		return emptyFallback;
	}

	// Only apply non-Fragment props when Component is not Fragment
	const componentProps =
		Component === Fragment
			? {} // When using Fragment, only pass children
			: {
					// Otherwise, pass all props
					className,
					id,
					role,
					'aria-label': ariaLabel,
					...restProps,
				};

	return createElement(Component, componentProps, mapped);
}
