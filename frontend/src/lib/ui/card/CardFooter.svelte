<script lang="ts">
  import { cn } from "$lib/utils";
  export let className: string = "";
  let restProps: Record<string, unknown> = {};
  let restClass: string | undefined;

  $: ({ class: restClass, ...restProps } = $$restProps as { class?: string } & Record<string, unknown>);
</script>

<div class={cn("flex items-center gap-2 pt-4", className, restClass)} {...restProps}>
  <slot />
</div>
