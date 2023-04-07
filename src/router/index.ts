import { createRouter, createWebHistory } from "vue-router";
import FileView from "@/views/FileView.vue";
import EditorView from "@/views/EditorView.vue";
import GeneratorView from "@/views/GeneratorView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "File",
      component: FileView,
    },
    {
      path: "/editor",
      name: "Editor",
      component: EditorView,
    },
    {
      path: "/generator",
      name: "Generator",
      component: GeneratorView,
    },
    // {
    //   path: "/about",
    //   name: "about",
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import("../views/AboutView.vue"),
    // },
  ],
});

export default router;
