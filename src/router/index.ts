import { createRouter, createWebHistory } from 'vue-router';
import FileView from '@/views/FileView.vue';
import EditorView from '@/views/EditorView.vue';
import GeneratorView from '@/views/GeneratorView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'File',
      component: FileView,
    },
    {
      path: '/editor',
      name: 'Editor',
      component: EditorView,
    },
    {
      path: '/generator',
      name: 'Generator',
      component: GeneratorView,
    },
  ],
});

export default router;
