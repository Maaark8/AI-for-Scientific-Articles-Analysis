<script lang="ts">
  import { cn } from "$lib/utils";
  import type { HTMLButtonAttributes } from "svelte/elements";

  export let variant: "default" | "secondary" | "outline" | "ghost" | "link" | "destructive" = "default";
  export let size: "default" | "sm" | "lg" | "icon" = "default";
  export let className: string = "";
  export let type: HTMLButtonAttributes["type"] = "button";
  export let disabled: HTMLButtonAttributes["disabled"] = undefined;
  export let as: "button" | "a" = "button";
  let restProps: Record<string, unknown> = {};
  let restClass: string | undefined;

  const base =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

  const variants: Record<typeof variant, string> = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90"
  };

  const sizes: Record<typeof size, string> = {
    default: "h-9 px-4 py-2",
    sm: "h-8 px-3 text-xs",
    lg: "h-10 px-6",
    icon: "h-9 w-9"
  };

  $: ({ class: restClass, ...restProps } = $$restProps as { class?: string } & Record<string, unknown>);
  $: classes = cn(base, variants[variant], sizes[size], className, restClass);
</script>

<svelte:element
  this={as}
  class={classes}
  type={as === "button" ? type : undefined}
  disabled={as === "button" ? disabled : undefined}
  aria-disabled={as !== "button" && disabled ? true : undefined}
  {...restProps}
>
  <slot />
</svelte:element>
