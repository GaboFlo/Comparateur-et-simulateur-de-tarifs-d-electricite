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
  export function differenceInDays(
    dateLeft: Date | number,
    dateRight: Date | number
  ): number;
  export function endOfDay(date: Date | number): Date;
  export function startOfDay(date: Date | number): Date;
}
