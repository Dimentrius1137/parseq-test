<template>
	<div class="layout">
		<RouterView />
	</div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>


<style scoped lang="scss">
    .layout{
        display: flex;
        justify-content: center;
    }
</style>