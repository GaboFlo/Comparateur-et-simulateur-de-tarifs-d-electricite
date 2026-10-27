import Button from "@mui/material/Button";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { useFormContext } from "../context/FormContext";

const UPDATE_CHECK_INTERVAL_MS = 10 * 60 * 1000;

/**
 * Détecte une nouvelle version déployée (nouveau service worker) même si l'onglet
 * reste ouvert, puis recharge entièrement la page. S'il y a des données importées
 * en mémoire (non persistées), on demande confirmation plutôt que de les perdre.
 */
export function useAppUpdate() {
  const { formState } = useFormContext();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const checkForUpdate = () => {
        if (navigator.onLine) {
          registration.update().catch(() => undefined);
        }
      };
      setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForUpdate();
      });
    },
  });

  const hasDataInMemory = Boolean(formState.parsedData?.length);

  useEffect(() => {
    if (!needRefresh) return;

    if (!hasDataInMemory) {
      void updateServiceWorker(true);
      return;
    }

    const snackbarKey = enqueueSnackbar(
      "Une nouvelle version est disponible.",
      {
        persist: true,
        preventDuplicate: true,
        action: (
          <Button color="inherit" onClick={() => updateServiceWorker(true)}>
            Actualiser
          </Button>
        ),
      }
    );
    return () => closeSnackbar(snackbarKey);
  }, [
    needRefresh,
    hasDataInMemory,
    updateServiceWorker,
    enqueueSnackbar,
    closeSnackbar,
  ]);
}
