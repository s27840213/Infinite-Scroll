<template>
  <div class="repo">
    <div class="repo__name">
      <span>{{ repo.name }}</span>
    </div>
    <div class="repo__description">
      <span>{{ repo.description }}</span>
    </div>
    <div class="repo__link">
      <a :href="repo.html_url">{{ repo.html_url }}</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IRepo } from "@/interface";
import { PropType } from "vue";

defineProps({
  repo: {
    type: Object as PropType<IRepo>,
    required: true,
  },
});
</script>

<style lang="scss">
.repo {
  display: flex;
  flex-direction: column;

  padding: 20px 32px;
  margin: 12px 16px;
  background-color: white;
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  border-radius: 2px;
  &__name {
    font-weight: bold;
  }

  &__description {
    font-size: 14px;
    margin-top: 8px;
  }

  &__link {
    font-size: 14px;
    margin-top: 8px;
  }
}
</style>
