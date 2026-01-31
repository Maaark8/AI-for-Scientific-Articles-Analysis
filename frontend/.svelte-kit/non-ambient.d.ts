
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/analysis" | "/articles" | "/articles/[pmid]";
		RouteParams(): {
			"/articles/[pmid]": { pmid: string }
		};
		LayoutParams(): {
			"/": { pmid?: string };
			"/analysis": Record<string, never>;
			"/articles": { pmid?: string };
			"/articles/[pmid]": { pmid: string }
		};
		Pathname(): "/" | "/analysis" | "/analysis/" | "/articles" | "/articles/" | `/articles/${string}` & {} | `/articles/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.ico" | "/icon.ico" | string & {};
	}
}