const store = new Map();

export function cookies() {
  return {
    get: (name) => {
      const val = store.get(name);
      return val !== undefined ? { name, value: val } : undefined;
    },
    getAll: () => Array.from(store.entries()).map(([name, value]) => ({ name, value })),
    set: (name, value) => {
      if (typeof name === 'object') {
        store.set(name.name, name.value);
      } else {
        store.set(name, value);
      }
    },
    delete: (name) => {
      const key = typeof name === 'object' ? name.name : name;
      store.delete(key);
    },
  };
}

export function headers() {
  return new Headers();
}

export default { cookies, headers };
