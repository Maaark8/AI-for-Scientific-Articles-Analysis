<script lang="ts">
  import { cn } from "$lib/utils";
  export let className: string = "";
  export let value: string = "";
  let restProps: Record<string, unknown> = {};
  let restClass: string | undefined;

  $: ({ class: restClass, ...restProps } = $$restProps as { class?: string } & Record<string, unknown>);
</script>

<input
  bind:value
  class={cn(
    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
    className,
    restClass
  )}
  {...restProps}
/>
