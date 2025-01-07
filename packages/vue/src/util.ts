// component = "index" or component = "users/[user]/comments/[comment]"
// look for _layout or users/_layout or users/[user]/_layout or users/[user]/comments/_layout
export async function resolveLayouts(component: string, resolver: any) {
  // for each directory, check if it has a _layout.tsx file
  // if it does, add it to the list of layouts
  const parts = component.split('/');
  const layouts: string[] = ['_layout'];
  if (parts.length > 1) {
    for (let i = 0; i < parts.length; i++) {
      const layout = parts.slice(0, i + 1).join('/') + '/_layout';
      layouts.push(layout);
    }
  }
  const components = [];
  for (const layout of layouts) {
    try {
      const result = await resolver(layout);
      const component = 'default' in result ? result.default : result;
      components.push(component);
    } catch {}
  }
  return components;
}
