<template>
  <div class="mb-3">
    <h1>File</h1>
    <p>You can upload and download the setup as JSON file.</p>
  </div>
  <v-row>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>Upload a JSON file</v-card-title>
        <v-card-subtitle>Sub Title</v-card-subtitle>
        <v-card-text>This ist the text</v-card-text>
        <v-card-actions class="justify-end">
          <v-file-input
            v-model="uploadedFile"
            accept="application/JSON"
            label="Drop or select a file"
            @change="uploadJson"
            ref="fileInput"
          ></v-file-input>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="12" md="6">
      <v-card>
        <v-card-title>Download as JSON file</v-card-title>
        <v-card-subtitle>Sub Title</v-card-subtitle>
        <v-card-text>
          <code class="pa-3 rounded-sm jsonCode" v-text="jsonContent"></code>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            elevation="2"
            prepend-icon="mdi-cloud-download"
            @click="downloadJson"
          >
            Download JSON File
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
  import { useMainStore } from '@/stores/main';
  import { computed, ref } from 'vue';

  const state = useMainStore();

  const jsonContent = computed(() => {
    return state.getJson;
  });

  const uploadedFile = ref();

  /**
   * Download all the data (players and games) as a json file (format see JsonObject.ts)
   */
  function downloadJson(): void {
    // Create a Blob file with the text content
    const blob = new Blob([state.getJson], { type: 'text/plain' });
    // Create a download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    // Create a file name with the current date and time
    const now = new Date();
    link.download = `lancraft-${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now
      .getHours()
      .toString()
      .padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now
      .getSeconds()
      .toString()
      .padStart(2, '0')}.json`;
    // Add the link to the DOM and click it
    document.body.appendChild(link);
    link.click();
    // Remove the link
    document.body.removeChild(link);
  }

  /**
   * The content of the uploaded json file is set to the Pinia status data to have all players and games.
   */
  function uploadJson(): void {
    const file = uploadedFile.value as File;

    if (!file) return;

    if (!file.name.endsWith('.json')) {
      uploadedFile.value = null;
      alert('Invalid file format. Only .json files are allowed.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (): void => {
      try {
        state.setStateFromJson(reader.result as string);
      } catch (error) {
        uploadedFile.value = null;
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  }
</script>

<style scoped>
  code {
    background-color: #e5e5e5;
    display: block;
    max-height: 300px;
    overflow-y: scroll;
  }
</style>
