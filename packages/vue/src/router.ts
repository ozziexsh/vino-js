import { resolveLayouts } from './util';

type Listener = (props: { props: any; component: any; layouts: any }) => void;

export class Redirect {}

class Router {
  public component: string = '';
  public resolver: any | null = null;
  public popstateListener: (e: PopStateEvent) => void = () => void 0;
  public props: any = {};
  public listeners: Listener[] = [];

  public init({ component, props }: { component: string; props: any }) {
    history.replaceState({ component, props }, '', window.location.pathname);

    this.popstateListener = async e => {
      if (!e.state?.component) {
        return;
      }
      this.swapComponent({
        component: e.state.component,
        props: e.state.props,
      });
    };

    window.addEventListener('popstate', this.popstateListener);
  }

  public async push(path: string): Promise<void> {
    const res = await this.http(path);
    if (!res.ok) {
      window.location.href = path;
      return;
    }
    const data = await res.json();
    this.swapComponent({
      component: data.component,
      props: data.props,
    });
    history.pushState(
      {
        component: data.component,
        props: data.props || {},
      },
      '',
      path,
    );
  }

  public async swapComponent({
    component,
    props,
  }: {
    component: string;
    props: any;
  }) {
    const result = await this.resolver!(component);
    const App = 'default' in result ? result.default : result;
    const Layouts = await resolveLayouts(component, this.resolver!);
    this.component = component;
    this.props = props;

    for (const listener of this.listeners) {
      listener({ component: App, props, layouts: Layouts });
    }
  }

  public onNavigate(callback: Listener) {
    this.listeners.push(callback);

    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  getXsrfToken() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('XSRF-TOKEN=')) {
        return cookie.substring('XSRF-TOKEN='.length, cookie.length);
      }
    }
    return null;
  }

  async http(url: string, options: RequestInit = {}) {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'X-Vino': 'true',
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': decodeURIComponent(this.getXsrfToken() || ''),
        ...options.headers,
      },
    });

    const location = response.headers.get('X-Vino-Location');

    if (location) {
      const url = new URL(location);
      if (url.host === window.location.host) {
        await this.push(url.pathname);
      } else {
        window.location.href = location;
      }
      return new Redirect();
    }

    return response;
  }
}

export const router = new Router();
