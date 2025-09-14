import MatomoTracker from "@jonkoops/matomo-tracker";
import { MatomoProvider, createInstance } from "@jonkoops/matomo-tracker-react";
import React, { JSX, ReactNode, useMemo } from "react";

const MATOMO_BASE_URL = "https://matomo.gaboflo.fr";

// Fonction pour suivre les erreurs
const trackError = (
  instance: MatomoTracker,
  error: Error,
  errorInfo: React.ErrorInfo | null
) => {
  instance.trackEvent({
    category: "Error",
    action: "JavaScript Error",
    name: error.toString(),
    customDimensions: errorInfo
      ? [{ id: 3, value: errorInfo.componentStack ?? "No component stack" }]
      : undefined,
  });
};

// Composant ErrorBoundary
class ErrorBoundary extends React.Component<
  { children: ReactNode; instance: MatomoTracker },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; instance: MatomoTracker }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    trackError(this.props.instance, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <h1>Oups !</h1>
          <p>Cela n'aurait pas du arriver, mais je suis prévenu !</p>
          <p>
            Vous pouvez essayer de recharger la page ou revenir plus tard. Si le
            problème persiste, n'hésitez pas à me contacter via{" "}
            <a href="https://github.com/GaboFlo/Comparateur-et-simulateur-de-tarifs-d-electricite/issues">
              GitHub
            </a>
          </p>
        </>
      );
    }

    return this.props.children;
  }
}

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

  return (
    <MatomoProvider value={instance}>
      <ErrorBoundary instance={instance}>{children}</ErrorBoundary>
    </MatomoProvider>
  );
};
