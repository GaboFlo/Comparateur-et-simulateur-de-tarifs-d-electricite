import InfoRounded from "@mui/icons-material/InfoRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { Alert, Box, Button, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";

export default function Info({
  handleClose,
}: Readonly<{ handleClose: () => void }>) {
  return (
    <Stack>
      <Typography
        variant="body1"
        sx={{ fontWeight: "medium", m: 1, textAlign: "justify" }}
      >
        Les comparateurs d'énergie actuels nous retournent toujours des
        simulations sur la base de vos déclarations approximatives et qui ne
        prennent pas en compte votre consommation réelle. Ces sites vous
        demandent votre adresse mail pour recevoir vos données simulées (et vous
        envoyer des mails par la suite). <br />
        <br /> L'objectif de ce simulateur est de s'affranchir de ces défaut,
        avec un code open-source.
      </Typography>
      <Alert
        severity="info"
        icon={<InfoRounded />}
        sx={{ m: 1, textAlign: "justify" }}
      >
        <b>
          Ce site, gratuit et sans inscription, vous permet de simuler
          réellement un changement de contrat, sur la base précise de vos
          consommations, heure par heure sur vos derniers mois, que vous
          exporterez via EDF (pour l'instant). <br /> La simulation est
          directement accessible à la fin des deux étapes.
        </b>
      </Alert>
      <Typography
        variant="body1"
        sx={{ fontWeight: "medium", m: 1, textAlign: "justify" }}
      >
        En prenant en compte votre consommation réelle des derniers mois, le
        site calcule combien vous auriez payé avec une autre option (avec ou
        sans heures creuses, Tempo ...).
      </Typography>
      <Alert
        severity="warning"
        icon={<WarningRoundedIcon />}
        sx={{ m: 1, textAlign: "justify" }}
      >
        Les simulations sont faites avec le <b>prix actuel</b> de l'électricité.
        Ce qui peut expliquer une variation entre votre facturation réelle et la
        simulation (si le prix de l'électricité a été modifié dans l'intervalle
        de la période simulée)
        <br /> <br />
        <b>Ce simulateur reste en phase de test</b>, pour toutes suggestions,
        remontées de bugs, ou participations merci de passer uniquement par{" "}
        <a
          href="https://github.com/GaboFlo/ComparateurFournisseurElectricity/issues"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </Alert>{" "}
      <Typography
        variant="body1"
        sx={{ fontWeight: "medium", m: 1, textAlign: "justify" }}
      >
        Vos données restent dans votre navigateur, et ne sont pas envoyées à un
        serveur.
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleClose}
          sx={{ mt: 2, marginRight: 3 }}
        >
          J'ai compris
        </Button>
      </Box>
    </Stack>
  );
}
