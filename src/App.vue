<template>
  <div class="error-msg">
    <span v-if="requestErrorMsg"> {{ requestErrorMsg }}...</span>
  </div>
  <div class="repo-container" ref="container" @scroll="handleScroll($event)">
    <div class="owner-name">
      <span>{{ `${repoOwner} repo list` }}</span>
    </div>
    <template v-for="repo in repos" :key="repo.id">
      <RepoItem :repo="repo"></RepoItem>
    </template>
    <div class="loading">
      <span v-if="isLoading">Loading next page...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import RepoItem from "@/components/RepoItem.vue";
import type { IParsedLinkHeader, IRepo } from "@/interface";
import { onMounted, reactive, ref } from "vue";

/**
 * @param repos - repos we get from the Github API
 * @param isLoading - is loading the next page
 * @param requestErrorMsg - error message from the request of the Github API
 * @param repoOwner - owner of the repos
 * @param container - the HTMLElement DOM Node of repo-container
 * @param parsedLinkHeaderInfo - parsed link header info from the response of the Github API, may contain the pagination info(next,prev,first,last)
 */
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
      if (requestErrorMsg.value !== "") {
        requestErrorMsg.value = "";
      }

      // parse the link header info from the response of the Github API to get the pagination info
      const linkHeader = response.headers.get("Link");
      if (linkHeader) {
        Object.assign(parsedLinkHeaderInfo, parseLinkHeader(linkHeader));
      }

      repos.value.push(...json);
    } else {
      // show the requrestErrorMsg
      requestErrorMsg.value = json.message;
    }
    isLoading.value = false;
  } catch (error) {
    isLoading.value = false;
    console.log(error);
  }
};

const handleScroll = (event: Event) => {
  // if we have no more next page or is loading the next page, we can just skip the following process
  if (!parsedLinkHeaderInfo.next && !isLoading.value) {
    return;
  }
  const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLElement;

  // if we scroll to the end of the repo-container, get the next page repos
  if (scrollTop + clientHeight >= scrollHeight) {
    getRepos(parsedLinkHeaderInfo.next?.url);
  }
};

onMounted(async () => {
  await getRepos();
  // if after getting the first page repos, we still have space to fill more repos(means no overflow) then send the API to get more repos
  // until the repo-container have overflow (scrollHeight > clientHeight)
  while (
    parsedLinkHeaderInfo.next &&
    container.value?.scrollHeight === container.value?.clientHeight
  ) {
    // I really need to use the getRepos function in the while loop, so I disable the following airbnb eslint rule
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
