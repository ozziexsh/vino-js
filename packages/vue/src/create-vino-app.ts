import { router } from './router';
import VinoApp from './vino-app.vue';
import { resolveLayouts } from './util';

interface Options {
  el: HTMLElement;
  resolve(name: string): any;
  setup(options: { el: HTMLElement; App: any; props: any }): void;
}

export async function createVinoApp({ resolve, setup, el }: Options) {
  const props = JSON.parse(el.dataset.props || '{}');
  const Component = resolve(props.component);

  router.component = props.component;
  router.props = props.props;
  router.resolver = resolve;

  router.init({ component: props.component, props: props.props });

  setup({
    App: VinoApp,
    props: {
      component: Component.default,
      layouts: await resolveLayouts(props.component, resolve),
    },
    el,
  });
}
