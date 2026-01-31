<script lang="ts">
  import { cn } from "$lib/utils";
  export let className: string = "";
  let restProps: Record<string, unknown> = {};
  let restClass: string | undefined;

  $: ({ class: restClass, ...restProps } = $$restProps as { class?: string } & Record<string, unknown>);
</script>

<h3 class={cn("text-lg font-semibold leading-none tracking-tight", className, restClass)} {...restProps}>
  <slot />
</h3>
