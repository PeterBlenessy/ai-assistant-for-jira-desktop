<template>
  <div v-if="issue">
    <div>
      <h3>Summary</h3>
      <p>{{ issue.fields.summary || 'Not available' }}</p>
    </div>
    <div>
      <h3>Description</h3>
      <p>{{ issue.fields.description || 'Not available' }}</p>
    </div>
    <div>
      <h3>Assignee</h3>
      <p>{{ issue.fields.assignee ? issue.fields.assignee.displayName : 'Not available' }}</p>
    </div>
    <div>
      <h3>Status</h3>
      <p>{{ issue.fields.status ? issue.fields.status.name : 'Not available' }}</p>
    </div>
    <div>
      <h3>Reporter</h3>
      <p>{{ issue.fields.reporter ? issue.fields.reporter.displayName : 'Not available' }}</p>
    </div>
    <div>
      <h3>Priority</h3>
      <p>{{ issue.fields.priority ? issue.fields.priority.name : 'Not available' }}</p>
    </div>
    <div>
      <h3>Issue Type</h3>
      <p>{{ issue.fields.issuetype ? issue.fields.issuetype.name : 'Not available' }}</p>
    </div>
    <div>
      <h3>Created Date</h3>
      <p>{{ issue.fields.created || 'Not available' }}</p>
    </div>
    <div>
      <h3>Updated Date</h3>
      <p>{{ issue.fields.updated || 'Not available' }}</p>
    </div>
    <div>
      <h3>Due Date</h3>
      <p>{{ issue.fields.duedate || 'Not available' }}</p>
    </div>
    <div>
      <h3>Comments</h3>
      <div v-if="issue.fields.comment && issue.fields.comment.comments.length">
        <div v-for="comment in issue.fields.comment.comments" :key="comment.id">
          <p><strong>{{ comment.author.displayName }}</strong> ({{ comment.created }}):</p>
          <p>{{ comment.body }}</p>
        </div>
      </div>
      <p v-else>Not available</p>
    </div>
  </div>
  <div v-else>
    <p>No issue selected</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  issue: {
    type: Object,
    required: false,
    default: null
  }
});
</script>
