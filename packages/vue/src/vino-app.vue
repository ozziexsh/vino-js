<script lang="ts">
import { h, onMounted, onUnmounted, shallowRef } from 'vue';
import VinoDefaultLayout from './vino-default-layout.vue';
import { router } from './router.ts';

export default {
  props: ['component', 'layouts'],

  setup(props) {
    const component = shallowRef(props.component);
    const layouts = shallowRef(props.layouts || [VinoDefaultLayout]);
    const off = shallowRef();

    onMounted(() => {
      off.value = router.onNavigate(event => {
        component.value = event.component;
        layouts.value = event.layouts || [VinoDefaultLayout];
      });
    });

    onUnmounted(() => {
      off.value?.();
    });

    return () => {
      console.log(component, layouts);
      return layouts.value.reduceRight(
        (acc: any, layout: any) => {
          return () => h(layout, {}, acc);
        },
        () => h(component.value),
      )();
    };
  },
};
</script>
