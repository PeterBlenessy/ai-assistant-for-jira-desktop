import { defineStore } from 'pinia';

export const useStore = defineStore('main', {
  state: () => ({
    name: ''
  }),
});

export function useGreetStore() {
  const store = useStore();
  return {
    get greetMsg() {
      return `Hello, ${store.name}!`;
    }
  };
}
