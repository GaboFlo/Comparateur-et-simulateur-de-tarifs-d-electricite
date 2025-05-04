import { useMatomo } from "@jonkoops/matomo-tracker-react";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  Link,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useFormContext } from "../context/FormContext";
import hpHcFile from "../statics/hp_hc.json";
import allOffersFile from "../statics/price_mapping.json";
import {
  HpHcSlot,
  OfferType,
  Option,
  OptionKey,
  PowerClass,
  PriceMappingFile,
  ProviderType,
} from "../types";
import HpHcSlotSelector from "./HpHcSelector";

const powerClasses: PowerClass[] = [6, 9, 12, 15, 18, 24, 30, 36];

const getDistinctOfferTypes = (
  mapping: PriceMappingFile,
  provider: ProviderType
) => {
  const offerTypes = new Set(
    mapping.filter((o) => o.provider === provider).map((item) => item.offerType)
  );
  return Array.from(offerTypes);
};

const getDisctinctProviders = (mapping: PriceMappingFile) => {
  const providers = new Set(mapping.map((item) => item.provider));
  return Array.from(providers);
};

export const getAvailableOfferForProvider = (
  mapping: PriceMappingFile,
  provider: ProviderType
): OfferType[] => {
  if (!provider) return [];
  const availableOffers = mapping
    .filter((item) => item.provider === provider)
    .map((item) => item.offerType);
  return Array.from(new Set(availableOffers));
};

export const getAvailableOptionsForOffer = (
  mapping: PriceMappingFile,
  provider: ProviderType,
  offerType: OfferType
): Option[] => {
  if (!offerType || !provider) return [];
  const availableOptions = mapping.filter(
    (item) => item.offerType === offerType && item.provider === provider
  );
  return availableOptions;
};

interface Props {
  handleNext: () => void;
}
export default function CurrentOfferForm({ handleNext }: Readonly<Props>) {
  const { formState, setFormState } = useFormContext();
  const { trackEvent } = useMatomo();
  const allOffers = allOffersFile as PriceMappingFile;
  const hpHc = hpHcFile as HpHcSlot[];
  const getLinkForOffer = (
    provider: ProviderType,
    offerType: OfferType,
    optionKey: OptionKey | ""
  ) => {
    return allOffers?.find((o) => {
      return (
        o.provider === provider &&
        o.offerType === offerType &&
        o.optionKey === optionKey
      );
    })?.link;
  };

  const handleChange = (event: SelectChangeEvent<string | number>) => {
    const { name, value } = event.target;
    const valueString = value.toString();
    setFormState((prevState) => {
      const newState = { ...prevState, [name]: value };
      if (name === "provider" && value !== prevState.provider && allOffers) {
        const offerType = getAvailableOfferForProvider(
          allOffers,
          valueString as ProviderType
        )[0];
        newState.offerType = offerType;
        newState.optionType = getAvailableOptionsForOffer(
          allOffers,
          valueString as ProviderType,
          offerType
        )[0].optionKey;
      }
      if (
        name === "offerType" &&
        valueString !== prevState.offerType &&
        allOffers
      ) {
        newState.optionType = getAvailableOptionsForOffer(
          allOffers,
          newState.provider,
          newState.offerType
        )[0].optionKey;
      }
      trackEvent({
        category: "form-change",
        action: name,
        name: valueString,
      });

      return newState;
    });
  };

  return (
    <>
      <Typography variant="h5" sx={{ textAlign: "center" }}>
        Votre offre actuelle
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth sx={{ marginY: 1 }}>
            <FormLabel required>Fournisseur actuel</FormLabel>
            <Select
              id="provider"
              name="provider"
              type="name"
              required
              value={formState.provider}
              onChange={handleChange}
              sx={{ height: "55px" }}
            >
              {allOffers &&
                getDisctinctProviders(allOffers).map((provider) => (
                  <MenuItem key={provider} value={provider}>
                    <ListItemIcon sx={{ marginRight: 1 }}>
                      <img
                        src={`/${provider}.png`}
                        alt={provider}
                        width="24"
                        height="24"
                      />
                    </ListItemIcon>
                    <ListItemText primary={provider} />
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ marginY: 1 }}>
            <FormLabel required>Option actuelle</FormLabel>
            <Select
              id="optionType"
              name="optionType"
              value={formState.optionType}
              onChange={handleChange}
              required
              disabled={!formState.offerType || !allOffers}
            >
              {allOffers &&
                getAvailableOptionsForOffer(
                  allOffers,
                  formState.provider,
                  formState.offerType
                ).map((option) => (
                  <MenuItem key={option.optionKey} value={option.optionKey}>
                    {option.optionName}
                    {option.overridingHpHcKey && (
                      <AccessTimeFilledIcon
                        sx={{
                          fontSize: "1rem",
                          verticalAlign: "middle",
                          color: "orange",
                          ml: 1,
                        }}
                      />
                    )}
                  </MenuItem>
                ))}
            </Select>
            <Typography
              sx={{ p: 1, fontWeight: "small" }}
              variant="caption"
              gutterBottom
            >
              <Link
                href={getLinkForOffer(
                  formState.provider,
                  formState.offerType,
                  formState.optionType
                )}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                <OpenInNewIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
                Perdu ? Cliquez ici pour découvrir le descriptif de l'option
                pour voir si elle correspond à votre situation.
              </Link>
            </Typography>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth sx={{ marginY: 1 }}>
            <FormLabel required>Offre actuelle</FormLabel>
            <Select
              id="offerType"
              name="offerType"
              value={formState.offerType}
              onChange={handleChange}
              required
              fullWidth
            >
              {!allOffers ? (
                <CircularProgress />
              ) : (
                getDistinctOfferTypes(allOffers, formState.provider).map(
                  (value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  )
                )
              )}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ marginY: 1 }}>
            <FormLabel required>Puissance de votre compteur (kVA)</FormLabel>
            <Select
              id="powerClass"
              name="powerClass"
              value={formState.powerClass}
              onChange={handleChange}
              required
            >
              {powerClasses.map((value: PowerClass) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
            <Typography
              sx={{ p: 1, fontWeight: "small" }}
              variant="caption"
              gutterBottom
            >
              <Link
                href="https://particulier.edf.fr/fr/accueil/gestion-contrat/compteur/modifier-puissance-electrique.html#:~:text=O%C3%B9%20trouver%20le%20niveau%20de,au%20verso%20de%20vos%20factures."
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                <OpenInNewIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
                Comment retrouver ma puissance ?
              </Link>
            </Typography>
          </FormControl>
        </Grid>
        {formState.provider !== "EDF" && (
          <Alert
            severity="warning"
            sx={{ m: 1, textAlign: "justify", width: "100%" }}
          >
            Pour l'instant, il est uniquement possible, en étape 2, d'intéger
            des données venant des fichiers EDF. Si vous n'êtes pas client EDF,
            revenez plus tard, le temps qu'Enedis mette à disposition les
            données nécessaires.
          </Alert>
        )}
        <Divider sx={{ width: "100%", m: 2 }} />
        {hpHc && <HpHcSlotSelector />}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column-reverse", sm: "row" },
            alignItems: "end",
            flexGrow: 1,
            gap: 1,
            pb: { xs: 12, sm: 0 },
            mt: { xs: 2, sm: 0 },
            mb: 1,

            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            endIcon={<ChevronRightRoundedIcon />}
            onClick={handleNext}
            sx={{ width: { xs: "100%", sm: "fit-content" } }}
          >
            Suivant
          </Button>
        </Box>
      </Grid>
    </>
  );
}
