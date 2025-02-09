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
import { getDefaultHpHcConfig } from "../services/httpCalls";
import { HpHcSlot, HourTime } from "../types";

const HpHcSlotSelector = () => {
  const theme = useTheme();
  const { setFormState } = useFormContext();

  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const [timeRanges, setTimeRanges] = useState<HpHcSlot[]>([]);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      const defaultHpHc = await getDefaultHpHcConfig();
      setTimeRanges(defaultHpHc);
      setFormState((prevState) => {
        return { ...prevState, hpHcConfig: defaultHpHc };
      });
    }
    fetchData();
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
            Ajoutez vos créneaux d'heures creuses
          </Typography>

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
                        bgcolor: isHC ? "success.light" : "grey.100",
                        borderRight:
                          i !== 47 ? "1px solid rgba(0,0,0,0.12)" : "none",
                        minWidth: 15,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "primary.light" },
                      }}
                      onClick={() => toggleTimeSlot(i)}
                      onMouseEnter={() => setHoveredSlot(i)}
                      onMouseLeave={() => setHoveredSlot(null)}
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

                      {hoveredSlot === i && (
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
            </>
          )}
          {!isDesktop && (
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
