import { useMatomo } from "@jonkoops/matomo-tracker-react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {
  CircularProgress,
  FormControl,
  FormLabel,
  Grid,
  Link,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { useEffect } from "react";
import { useFormContext } from "../context/FormContext";
import { getAvailableOffers } from "../services/httpCalls";
import {
  OfferType,
  Option,
  OptionKey,
  PowerClass,
  PriceMappingFile,
} from "../types";

const powerClasses: PowerClass[] = [6, 9, 12, 15, 18, 24, 30, 36];

const getDistinctOfferTypes = (mapping: PriceMappingFile) => {
  const offerTypes = new Set(mapping.map((item) => item.offerType));
  return Array.from(offerTypes);
};

export const getAvailableOptionsForOffer = (
  mapping: PriceMappingFile,
  offerType: OfferType
): Option[] => {
  if (!offerType) return [];
  const availableOptions = mapping.filter(
    (item) => item.offerType === offerType
  );
  return availableOptions;
};

export default function CurrentOfferForm() {
  const { formState, setFormState } = useFormContext();
  const { trackEvent } = useMatomo();

  useEffect(() => {
    const fetchOffers = async () => {
      formState.isGlobalLoading = true;
      const allOffers = await getAvailableOffers();
      setFormState((prevState) => {
        return { ...prevState, allOffers, isGlobalLoading: false };
      });
    };
    fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getLinkForOffer = (offerType: OfferType, optionKey: OptionKey | "") => {
    return formState.allOffers?.find((o) => {
      return o.offerType === offerType && o.optionKey === optionKey;
    })?.link;
  };

  const handleChange = (event: SelectChangeEvent<string | number>) => {
    const { name, value } = event.target;
    setFormState((prevState) => {
      const newState = { ...prevState, [name]: value };
      if (
        name === "offerType" &&
        value !== prevState.offerType &&
        formState.allOffers
      ) {
        newState.optionType = getAvailableOptionsForOffer(
          formState.allOffers,
          newState.offerType
        )[0].optionKey;
      }
      trackEvent({
        category: "form-change",
        action: name,
        name: value.toString(),
      });

      return newState;
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth sx={{ marginY: 1 }}>
          <FormLabel required>Fournisseur actuel</FormLabel>
          <Select
            id="supplier"
            name="supplier"
            type="name"
            required
            value={formState.supplier}
            onChange={handleChange}
            disabled
            sx={{ height: "55px" }}
          >
            <MenuItem value="EDF">
              <ListItemIcon sx={{ marginRight: 1 }}>
                <img src="/edf.png" alt="EDF" width="24" height="24" />
              </ListItemIcon>
              <ListItemText primary="EDF" />
            </MenuItem>
          </Select>
        </FormControl>{" "}
        <FormControl fullWidth sx={{ marginY: 1 }}>
          <FormLabel required>Option actuelle</FormLabel>
          <Select
            id="optionType"
            name="optionType"
            value={formState.optionType}
            onChange={handleChange}
            required
            disabled={!formState.offerType || !formState.allOffers}
          >
            {formState.allOffers &&
              getAvailableOptionsForOffer(
                formState.allOffers,
                formState.offerType
              ).map((option) => (
                <MenuItem key={option.optionKey} value={option.optionKey}>
                  {option.optionName}
                </MenuItem>
              ))}
          </Select>
          <Typography
            sx={{ p: 1, fontWeight: "small" }}
            variant="caption"
            gutterBottom
          >
            <Link
              href={getLinkForOffer(formState.offerType, formState.optionType)}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
              <OpenInNewIcon sx={{ fontSize: "1rem", mr: 0.5 }} />
              Perdu ? Cliquez ici pour découvrir le descriptif de l'option pour
              voir si elle correspond à votre situation.
            </Link>
          </Typography>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        {" "}
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
            {!formState.allOffers ? (
              <CircularProgress />
            ) : (
              getDistinctOfferTypes(formState.allOffers).map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))
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
    </Grid>
  );
}
