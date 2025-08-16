import { useMatomo } from "@jonkoops/matomo-tracker-react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import BusinessIcon from "@mui/icons-material/Business";
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import SettingsIcon from "@mui/icons-material/Settings";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { useFormContext } from "../context/FormContext";
import allOffersFile from "../statics/price_mapping.json";
import {
  OfferType,
  PowerClass,
  PriceMappingFile,
  ProviderType,
} from "../types";
import ActionButton from "./ActionButton";
import FormCard from "./FormCard";
import FormField from "./FormField";
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
) => {
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
) => {
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

  const handleChange = (field: string, value: string | number) => {
    setFormState((prevState) => {
      const newState = { ...prevState, [field]: value };

      if (field === "provider" && value !== prevState.provider && allOffers) {
        const offerType = getAvailableOfferForProvider(
          allOffers,
          value as ProviderType
        )[0];
        newState.offerType = offerType;
        newState.optionType = getAvailableOptionsForOffer(
          allOffers,
          value as ProviderType,
          offerType
        )[0].optionKey;
      }

      if (field === "offerType" && value !== prevState.offerType && allOffers) {
        newState.optionType = getAvailableOptionsForOffer(
          allOffers,
          newState.provider,
          newState.offerType
        )[0].optionKey;
      }

      trackEvent({
        category: "form-change",
        action: field,
        name: value.toString(),
      });

      return newState;
    });
  };

  const providerOptions = getDisctinctProviders(allOffers).map((provider) => ({
    value: provider,
    label: provider,
    icon: (
      <img
        src={`/${provider}.png`}
        alt={`Logo ${provider}`}
        width="20"
        height="20"
        style={{
          borderRadius: 4,
          objectFit: "contain",
          display: "block", // Assurer un affichage correct
        }}
      />
    ),
  }));

  const offerTypeOptions = getDistinctOfferTypes(
    allOffers,
    formState.provider
  ).map((offerType) => ({
    value: offerType,
    label: offerType,
  }));

  const optionTypeOptions = getAvailableOptionsForOffer(
    allOffers,
    formState.provider,
    formState.offerType
  ).map((option) => ({
    value: option.optionKey,
    label: option.optionName,
  }));

  const powerClassOptions = powerClasses.map((power) => ({
    value: power,
    label: `${power} kVA`,
  }));

  const isFormValid =
    formState.provider &&
    formState.offerType &&
    formState.optionType &&
    formState.powerClass;

  return (
    <Stack spacing={4}>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            mb: 1,
          }}
        >
          Votre offre actuelle
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            mx: "auto",
          }}
        >
          Configurez votre contrat actuel pour obtenir une simulation précise de
          vos économies potentielles
        </Typography>
      </Box>

      <Grid
        container
        spacing={3}
        sx={{
          alignItems: "stretch",
          "& .MuiGrid-item": {
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        <Grid size={{ xs: 12 }}>
          <FormCard
            title="Fournisseur"
            subtitle="Sélectionnez votre fournisseur d'électricité actuel"
            icon={<BusinessIcon />}
          >
            <FormField
              label="Fournisseur actuel"
              type="select"
              value={formState.provider}
              onChange={(value) => handleChange("provider", value)}
              options={providerOptions}
              required
            />
          </FormCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormCard
            title="Type d'offre"
            subtitle="Choisissez le type de contrat que vous avez"
            icon={<AccountBalanceIcon />}
          >
            <FormField
              label="Type d'offre"
              type="select"
              value={formState.offerType}
              onChange={(value) => handleChange("offerType", value)}
              options={offerTypeOptions}
              required
            />
          </FormCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormCard
            title="Option tarifaire"
            subtitle="Sélectionnez votre option (Base, Heures Creuses, etc.)"
            icon={<SettingsIcon />}
          >
            <FormField
              label="Option tarifaire"
              type="select"
              value={formState.optionType}
              onChange={(value) => handleChange("optionType", value)}
              options={optionTypeOptions}
              required
            />
          </FormCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormCard
            title="Puissance souscrite"
            subtitle="Indiquez la puissance de votre compteur"
            icon={<ElectricMeterIcon />}
          >
            <FormField
              label="Puissance (kVA)"
              type="select"
              value={formState.powerClass}
              onChange={(value) => handleChange("powerClass", value)}
              options={powerClassOptions}
              required
            />
          </FormCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <FormCard
            title="Créneaux d'heures creuses"
            subtitle="Ajustez vos créneaux d'heures creuses pour une simulation précise"
            icon={<AccessTimeIcon />}
          >
            <HpHcSlotSelector />
          </FormCard>
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <ActionButton
          variant="primary"
          onClick={handleNext}
          disabled={!isFormValid}
          sx={{ minWidth: 200 }}
          aria-describedby={
            !isFormValid ? "form-validation-message" : undefined
          }
        >
          Continuer vers l'import des données
        </ActionButton>
      </Box>

      {!isFormValid && (
        <Typography
          id="form-validation-message"
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 1 }}
        >
          Veuillez remplir tous les champs obligatoires pour continuer
        </Typography>
      )}
    </Stack>
  );
}
