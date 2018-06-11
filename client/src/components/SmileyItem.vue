<template>
  <span class="smiley-item">
    {{_.first(_.toArray(smiley.char))}}
  </span>
</template>

<script>
export default {
  name: 'smiley-item',
  props: {
    smiley: Object
  }
}
</script>
