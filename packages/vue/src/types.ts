export interface VinoAction {
  __vino: true;
  component: string;
  action: string;
}

export interface LaravelErrors {
  [key: string]: string | string[];
}

export interface FlattenedErrors {
  [key: string]: string;
}
