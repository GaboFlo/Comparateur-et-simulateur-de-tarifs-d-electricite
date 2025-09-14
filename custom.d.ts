declare module "*.svg" {
  import React from "react";
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module "@mui/icons-material/UploadFileRounded" {
  const UploadFileRoundedIcon: React.ComponentType<
    React.SVGProps<SVGSVGElement>
  >;
  export default UploadFileRoundedIcon;
}

declare module "@mui/icons-material/Settings" {
  const SettingsIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export default SettingsIcon;
}

declare module "@mui/icons-material/TrendingUp" {
  const TrendingUpIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  export default TrendingUpIcon;
}
