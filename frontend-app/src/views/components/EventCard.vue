<template>
  <div>
    <h3>{{ event.title }}</h3>
    <p>{{ event.date }}</p>
    <p>{{ event.description }}</p>
  </div>
</template>

<script>
export default {
  name: 'EventCard',
  props: { event: Object },
};
</script>
