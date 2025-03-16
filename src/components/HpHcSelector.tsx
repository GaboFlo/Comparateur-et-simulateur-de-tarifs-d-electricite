import { useMatomo } from "@jonkoops/matomo-tracker-react";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useFormContext } from "../context/FormContext";
import hphc_data from "../statics/hp_hc.json";
import { HourTime, HpHcSlot } from "../types";

interface Props {
  readOnly?: boolean;
}
const HpHcSlotSelector = ({ readOnly = false }: Readonly<Props>) => {
  const theme = useTheme();
  const { trackEvent } = useMatomo();
  const { formState, setFormState } = useFormContext();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [timeRanges, setTimeRanges] = useState<HpHcSlot[]>([]);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const defaultHpHc = hphc_data as HpHcSlot[];
      setTimeRanges(defaultHpHc);
      setFormState((prevState) => {
        return { ...prevState, hpHcConfig: defaultHpHc };
      });
    }
    readOnly ? setTimeRanges(formState.hpHcConfig ?? []) : fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const parseTime = (timeStr: HourTime) => {
    return timeStr.hour * 60 + timeStr.minute;
  };

  const toggleTimeSlot = (slotIndex: number) => {
    const blockMid = slotIndex * 30;
    const isHC = timeRanges.some((tr) => {
      const start = parseTime(tr.startSlot);
      const end = parseTime(tr.endSlot);
      return blockMid >= start && blockMid < end;
    });

    if (isHC) {
      // Remove the slot
      setTimeRanges((prev) =>
        prev.filter((tr) => {
          const start = parseTime(tr.startSlot);
          const end = parseTime(tr.endSlot);
          return !(blockMid >= start && blockMid < end);
        })
      );
      trackEvent({
        category: "HPHC",
        action: "Slot action",
        name: "Remove",
        value: blockMid,
      });
    } else {
      const newSlot: HpHcSlot = {
        startSlot: {
          hour: Math.floor(blockMid / 60),
          minute: blockMid % 60,
        },
        endSlot: {
          hour: Math.floor((blockMid + 30) / 60),
          minute: (blockMid + 30) % 60,
        },
        slotType: "HC",
      };
      setTimeRanges((prev) => [...prev, newSlot]);
      trackEvent({
        category: "HPHC",
        action: "Slot action",
        name: "Add",
        value: blockMid,
      });
    }

    setFormState((prevState) => {
      return { ...prevState, hpHcConfig: timeRanges };
    });
  };

  return (
    <Box sx={{ textAlign: "center", alignContent: "center", width: "100%" }}>
      {timeRanges && (
        <Stack spacing={3}>
          <Typography variant="h5">
            {readOnly ? "Selon " : "Ajustez "} vos créneaux d'heures creuses
          </Typography>
          {!readOnly && (
            <Typography variant="subtitle2" style={{ fontSize: "0.75rem" }}>
              Cliquez sur les créneaux pour les ajouter ou les retirer
            </Typography>
          )}

          {isDesktop && (
            <>
              <Box
                display="flex"
                borderRadius={1}
                overflow="hidden"
                border={1}
                sx={{ m: 2 }}
              >
                {Array.from({ length: 48 }, (_, i) => {
                  const blockMid = i * 30 + 15;
                  const isHC = timeRanges.some((tr) => {
                    const start = parseTime(tr.startSlot);
                    const end = parseTime(tr.endSlot);
                    return blockMid >= start && blockMid < end;
                  });

                  return (
                    <Box
                      key={i}
                      flex={1}
                      textAlign="center"
                      py={1}
                      position="relative"
                      sx={{
                        bgcolor: isHC ? "success.light" : "grey.light",
                        borderRight:
                          i !== 47 ? "1px solid rgba(0,0,0,0.12)" : "none",
                        minWidth: 15,
                        ...(readOnly
                          ? {}
                          : {
                              "&:hover": { bgcolor: "primary.light" },
                              cursor: "pointer",
                            }),
                      }}
                      onClick={() => !readOnly && toggleTimeSlot(i)}
                      onMouseEnter={() => !readOnly && setHoveredSlot(i)}
                      onMouseLeave={() => !readOnly && setHoveredSlot(null)}
                    >
                      {i % 2 === 0 ? (
                        <Typography variant="caption">
                          {Math.floor(i / 2)
                            .toString()
                            .padStart(2, "0")}
                        </Typography>
                      ) : (
                        <Typography variant="caption"></Typography>
                      )}

                      {hoveredSlot === i && !readOnly && (
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          sx={{
                            transform: "translate(-50%, -50%)",
                            bgcolor: "background.paper",
                            p: 0.25,
                          }}
                        >
                          <IconButton size="small" sx={{ maxWidth: 20 }}>
                            {isHC ? (
                              <DeleteIcon color="error" />
                            ) : (
                              <AddIcon color="primary" />
                            )}
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
              <Box display="flex" gap={1} sx={{ alignSelf: "center" }}>
                <Chip
                  label="Heures creuses"
                  color="success"
                  sx={{ maxWidth: "120px", height: 1 }}
                />
                <Chip
                  label="Heures pleines"
                  sx={{
                    maxWidth: "120px",
                    height: 1,
                    backgroundColor: "grey.light",
                  }}
                />
              </Box>
              <Alert severity="warning" sx={{ m: 1, textAlign: "justify" }}>
                Certaines options (
                <AccessTimeFilledIcon
                  sx={{
                    fontSize: "1rem",
                    verticalAlign: "middle",
                    color: "orange",
                  }}
                />
                ) imposent des heures creuses, votre sélection{" "}
                {readOnly ? "n'a pas été" : "ne sera pas"} prise en compte sur
                ces options
              </Alert>
            </>
          )}
          {!isDesktop && !readOnly && (
            <Alert severity="warning" sx={{ m: 1, textAlign: "justify" }}>
              Seulement sur ordinateur
            </Alert>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default HpHcSlotSelector;
