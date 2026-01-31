<script lang="ts">
  import { cn } from "$lib/utils";
  export let className: string = "";
  let restProps: Record<string, unknown> = {};
  let restClass: string | undefined;

  $: ({ class: restClass, ...restProps } = $$restProps as { class?: string } & Record<string, unknown>);
</script>

<label class={cn("text-sm font-medium leading-none", className, restClass)} {...restProps}>
  <slot />
</label>
