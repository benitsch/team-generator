<template>
  <div class="mb-3">
    <h1>This is the File view</h1>
    <p>You can upload and download the setup as JSON file.</p>
  </div>
  <v-row>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>Upload a JSON file</v-card-title>
        <v-card-subtitle>Sub Title</v-card-subtitle>
        <v-card-text>This ist the text</v-card-text>
        <v-card-actions class="justify-end">
          <!-- TODO implement drag n drop file upload component (or v-file-input component) -->
          <v-btn elevation="2" prepend-icon="mdi-cloud-upload">
            Upload JSON File
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>Download as JSON file</v-card-title>
        <v-card-subtitle>Sub Title</v-card-subtitle>
        <v-card-text>
          <!-- TODO add json code here with max height e.g. 150px and it should be a computed on player, games, etc. To have a preview of the json content -->
          <code class="pa-3 rounded-sm">This ist the text CODE</code>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn elevation="2" prepend-icon="mdi-cloud-download">
            Download JSON File
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script lang="ts">
export default {

  props: {
    // name: String,
    // id: [Number, String],
    // msg: { type: String, required: true },
    // metadata: null
  },
  data() {
    return {
      jsonContent: null
    };
  },
};
</script>

<style scoped>
code {
  background-color: #e5e5e5;
}
</style>
