import {
  FormControl,
  FormLabel,
  Grid,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { styled } from "@mui/system";
import { useEffect } from "react";
import { useFormContext } from "../context/FormContext";
import { getAvailableOffers } from "../services/httpCalls";
import { OfferType, OptionName, PowerClass, PriceMappingFile } from "../types";

const FormGrid = styled(Grid)(() => ({
  display: "flex",
  flexDirection: "row",
}));

const powerClasses: PowerClass[] = [6, 9, 12, 15, 18, 24, 30, 36];

export const getAvailableOptionsForOffer = (
  mapping: PriceMappingFile,
  offerType: OfferType | ""
): OptionName[] => {
  if (!offerType) return [];
  const availableOptions = mapping
    .filter((item) => item.offerType === offerType)
    .map((item) => item.optionName);
  return availableOptions as OptionName[];
};

export default function CurrentOfferForm() {
  const { formState, setFormState } = useFormContext();

  useEffect(() => {
    const fetchOffers = async () => {
      const allOffers =
        (await getAvailableOffers()) as PriceMappingFile; /* TOO zod */
      setFormState((prevState) => {
        return { ...prevState, allOffers };
      });
    };
    fetchOffers();
  }, []);

  const handleChange = (event: SelectChangeEvent<string | number>) => {
    const { name, value } = event.target;
    setFormState((prevState) => {
      const newState = { ...prevState, [name]: value };
      if (name === "offerType" && value !== prevState.offerType) {
        newState.optionType = ""; // Reset optionType when offerType changes
      }
      return newState;
    });
  };

  return (
    <FormGrid container>
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
      </FormControl>
      <FormControl fullWidth sx={{ marginY: 1 }}>
        <FormLabel required>Offre</FormLabel>
        <Select
          id="offerType"
          name="offerType"
          value={formState.offerType}
          onChange={handleChange}
          required
          fullWidth
        >
          <MenuItem value="BLEU">Bleu</MenuItem>
          <MenuItem value="VERT">Vert</MenuItem>
          <MenuItem value="ZEN">Zen</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ marginY: 1 }}>
        <FormLabel required>Option</FormLabel>
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
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <FormControl fullWidth sx={{ marginY: 1 }}>
        <FormLabel required>Puissance (kVA)</FormLabel>
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
      </FormControl>
    </FormGrid>
  );
}
