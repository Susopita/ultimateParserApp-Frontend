<script lang="ts">
	import "../app.css";
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import { i18n } from '$lib/stores/i18n.svelte';

	let { children } = $props();

	onMount(() => {
		theme.init();
		i18n.init();
	});
</script>

<svelte:head>
	<link rel="icon" href="{favicon}" />
</svelte:head>

{@render children()}
