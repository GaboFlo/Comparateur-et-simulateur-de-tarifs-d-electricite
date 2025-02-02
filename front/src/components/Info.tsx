import InfoRounded from "@mui/icons-material/InfoRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import { Alert, Stack } from "@mui/material";
import Typography from "@mui/material/Typography";

export default function Info() {
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
        envoyer des mails par la suite).
      </Typography>
      <Alert
        severity="info"
        icon={<InfoRounded />}
        sx={{ m: 1, textAlign: "justify" }}
      >
        Ce site vous permet de simuler réellement un changement de contrat, sur
        la base précise de vos consommations, 30 minutes par 30 minutes sur vos
        derniers mois, que vous exporterez via EDF. <br /> La simulation est
        directement accessible à la fin des deux étapes.
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
        <ul>
          <li>
            La simulation ne calcule pas les taxes (qui seront les mêmes peu
            importe votre fournisseur)
          </li>
          <li>
            Les prix affichés ne tiennent pas compte des changements du 01
            Février 2025
          </li>
          <li>Seul EDF est pour l'instant représenté</li>
          <li>Ce simulateur est en phase de test</li>
        </ul>
      </Alert>{" "}
      <Typography
        variant="body1"
        sx={{ fontWeight: "medium", m: 1, textAlign: "justify" }}
      >
        Vos données sont conservées uniquement le temps des calculs.
      </Typography>
    </Stack>
  );
}
