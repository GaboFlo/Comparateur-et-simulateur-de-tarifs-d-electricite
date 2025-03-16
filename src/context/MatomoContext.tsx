import MatomoTracker from "@jonkoops/matomo-tracker";
import { MatomoProvider, createInstance } from "@jonkoops/matomo-tracker-react";
import { JSX, ReactNode, useMemo } from "react";

const MATOMO_BASE_URL = "https://matomo.gaboflo.fr";

export const MatomoContextProvider = ({
  children,
}: {
  children?: ReactNode;
}): JSX.Element => {
  const instance = useMemo<MatomoTracker>(() => {
    return createInstance({
      urlBase: MATOMO_BASE_URL,
      siteId: Number(2),
    });
  }, []);

  return <MatomoProvider value={instance}>{children}</MatomoProvider>;
};
