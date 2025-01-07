<script setup>
import { router } from './router';

const props = defineProps(['href', 'children']);

async function onClick() {
  router.push(props.href);
}
</script>

<template>
  <a :href="href" @click.prevent="onClick">
    <slot />
  </a>
</template>
