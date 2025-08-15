declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "date-fns" {
  export function format(
    date: Date | number | string,
    formatStr: string
  ): string;
}
