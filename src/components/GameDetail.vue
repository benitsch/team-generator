<template>
  <v-form ref="form">
    <v-card min-width="250px">
      <v-card-title class="d-flex">
        {{ title }}
        <v-spacer></v-spacer>
        <v-btn
          v-if="isEdit"
          color="red"
          variant="outlined"
          size="small"
          icon="mdi-delete"
          title="Delete Game"
          @click="emit('deleteGame')"
        ></v-btn>
      </v-card-title>
      <v-card-text>
        <v-text-field
          v-model="game.name"
          label="Game name"
          variant="outlined"
          :rules="[rules.required]"
        ></v-text-field>
        <v-text-field
          v-model="game.genre"
          label="Game genre"
          variant="outlined"
          :rules="[rules.required]"
        ></v-text-field>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn
          elevation="2"
          color="red darken-1"
          text="Cancel"
          @click="emit('cancelDialog')"
        >
        </v-btn>
        <v-btn elevation="2" color="green darken-1" @click="submit">
          {{ isEdit ? 'Edit' : 'Add' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import Game from '@/models/Game';

  const emit = defineEmits([
    'saveGame',
    'cancelGame',
    'deleteGame',
    'cancelDialog',
  ]);

  const props = defineProps({
    gameDetail: Game || null,
  });

  const isEdit = computed(() => {
    return props.gameDetail?.id !== undefined;
  });

  const form = ref();
  const title = ref<string>(isEdit.value ? 'Edit game' : 'Add new game');

  const game = ref<Game>(new Game());
  game.value.name = props.gameDetail?.name ?? '';
  game.value.genre = props.gameDetail?.genre ?? '';

  const rules = ref({
    required: (value: string) => !!value || 'Field is required',
  });

  async function submit(): Promise<void> {
    const isValid = await form.value.validate();
    if (isValid.valid) {
      emit('saveGame', game.value);
    }
  }

  // TODO(bn) next to game name required rule, also a check if name already exist in games array;
</script>

<style scoped></style>
