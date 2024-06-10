<template>
  <div class="node">
    {{ node.name }}
    <div class="children" v-if="node.children && node.children.length">
      <recursive-tree
          v-for="child in node.children"
          :key="child.id"
          :node="child"
      ></recursive-tree>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'RecursiveTree',
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped>

</style>