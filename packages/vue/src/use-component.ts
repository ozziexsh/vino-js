import { Redirect, router } from './router';
import { onMounted, onUnmounted, reactive, shallowRef } from 'vue';
import { FlattenedErrors, LaravelErrors, VinoAction } from './types.ts';

function flattenErrors(errors: LaravelErrors): FlattenedErrors {
  const flattened: FlattenedErrors = {};
  for (const key in errors) {
    const error = errors[key];
    flattened[key] = Array.isArray(error) ? error[0] : error;
  }
  return flattened;
}

export function useAction<T>(obj: VinoAction) {
  const state = reactive({
    loading: false,
    errors: null as FlattenedErrors | null,
    data: null as T | null,
    async run(...args: any[]) {
      state.loading = true;
      const res = await router.http('/vino/action', {
        method: 'POST',
        // todo: handle file uploads
        body: JSON.stringify({ args }),
        headers: {
          'X-Vino-Component': obj.component,
          'X-Vino-Action': obj.action,
          'X-Vino-ActionType': 'args',
        },
      });
      if (res instanceof Redirect) {
        return;
      }
      state.loading = false;
      const data = await res.json();
      if (res.ok) {
        state.data = data;
        state.errors = null;

        return { ok: true, data: data, errors: null };
      } else {
        const errors = flattenErrors(data?.errors);
        state.errors = errors;
        state.data = null;

        return { ok: false, data: null, errors };
      }
    },
  });

  return state;
}

export function useFormAction<T extends {} = {}>(
  obj: VinoAction,
  initialData: T,
) {
  const state = reactive({
    loading: false,
    errors: null as null | Record<string, string>,
    data: null,
    state: { ...initialData },
    reset() {
      state.state = { ...initialData };
    },
    async run() {
      state.loading = true;
      const res = await router.http('/vino/action', {
        method: 'POST',
        // todo: handle file uploads
        body: JSON.stringify(state.state),
        headers: {
          'X-Vino-Component': obj.component,
          'X-Vino-Action': obj.action,
        },
      });
      if (res instanceof Redirect) {
        return;
      }
      state.loading = false;
      const data = await res.json();
      if (res.ok) {
        state.data = data;
        state.errors = null;

        return { ok: true, data: data, errors: null };
      } else {
        const errors = flattenErrors(data?.errors);
        state.errors = errors;
        state.data = null;

        return { ok: false, data: null, errors };
      }
    },
  });

  return state;
}

export function useComponent() {
  const props = shallowRef(router.props);
  const off = shallowRef();

  onMounted(() => {
    off.value = router.onNavigate(event => {
      props.value = event.props;
    });
  });

  onUnmounted(() => {
    off.value?.();
  });

  return props;
}
