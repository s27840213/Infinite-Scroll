<template>
  <div class="loading">
    <span v-if="isLoading">Loading next page...</span>
    <span v-if="requestErrorMsg"> {{ requestErrorMsg }}...</span>
  </div>
  <div class="repo-container" ref="container" @scroll="handleScroll($event)">
    <div class="owner-name">
      <span>{{ `${repoOwner} repo list` }}</span>
    </div>
    <template v-for="repo in repos" :key="repo.id">
      <RepoItem :repo="repo"></RepoItem>
    </template>
  </div>
</template>

<script setup lang="ts">
import RepoItem from "@/components/RepoItem.vue";
import type { IParsedLinkHeader, IRepo } from "@/interface";
import { onMounted, reactive, ref } from "vue";

const repos = ref([] as Array<IRepo>);
const isLoading = ref(false);
const requestErrorMsg = ref("");
const repoOwner = "antfu";
const container = ref<HTMLElement | null>(null);
const parsedLinkHeaderInfo = reactive<IParsedLinkHeader>({});

const parseLinkHeader = (linkHeader: string): IParsedLinkHeader => {
  const links = linkHeader.split(", ");

  return links.reduce((acc, curr) => {
    const [url, rel] = curr.split("; ");
    const parsedUrl = url.slice(1, -1); // remove "<" and ">" from url
    const pageIndex = parseInt(parsedUrl.split("&page=")[1], 10);

    return Object.assign(acc, {
      [rel.split("=")[1].slice(1, -1)]: {
        url: parsedUrl,
        pageIndex,
      },
    });
  }, {});
};

const getRepos = async (url?: string) => {
  try {
    isLoading.value = true;
    const response = await fetch(
      url ?? `https://api.github.com/users/${repoOwner}/repos?per_page=6`
    );

    const json = await response.json();
    if (response.ok) {
      const linkHeader = response.headers.get("Link");
      if (linkHeader) {
        Object.assign(parsedLinkHeaderInfo, parseLinkHeader(linkHeader));
      }
      repos.value.push(...json);
      isLoading.value = false;
    } else {
      requestErrorMsg.value = json.message;
      console.log(json);
    }
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    console.log(error);
  }
};

const handleScroll = (event: Event) => {
  if (!parsedLinkHeaderInfo.next && !isLoading.value) {
    return;
  }
  const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLElement;

  if (scrollTop + clientHeight >= scrollHeight) {
    getRepos(parsedLinkHeaderInfo.next?.url);
  }
};

onMounted(async () => {
  await getRepos();
  while (
    parsedLinkHeaderInfo.next &&
    container.value?.scrollHeight === container.value?.clientHeight
  ) {
    // eslint-disable-next-line no-await-in-loop
    await getRepos(parsedLinkHeaderInfo.next.url);
  }
});
</script>

<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f1f1f1;
}

.owner-name {
  font-size: 36px;
  padding: 8px 20px 0px 20px;
  font-weight: bold;
}

.repo-container {
  width: 100%;
  height: 100%;
  overflow-y: scroll;
}

.loading {
  padding: 16px 0px;
  text-align: center;
}
</style>
