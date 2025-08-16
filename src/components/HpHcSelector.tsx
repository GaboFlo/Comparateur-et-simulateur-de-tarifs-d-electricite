import { useMatomo } from "@jonkoops/matomo-tracker-react";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import LightModeIcon from "@mui/icons-material/LightMode";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import {
  Alert,
  Box,
  Chip,
  Fade,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Zoom,
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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const defaultHpHc = hphc_data as HpHcSlot[];
      setTimeRanges(defaultHpHc);
      setFormState((prevState) => {
        return { ...prevState, hpHcConfig: defaultHpHc };
      });
    }
    readOnly ? setTimeRanges(formState.hpHcConfig ?? []) : fetchData();

    // Animation d'apparition
    setTimeout(() => setIsLoaded(true), 100);
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
    <Fade in={isLoaded} timeout={800}>
      <Box sx={{ textAlign: "center", alignContent: "center", width: "100%" }}>
        {timeRanges && (
          <Stack spacing={4}>
            <Zoom
              in={isLoaded}
              timeout={600}
              style={{ transitionDelay: "200ms" }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    background:
                      "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    mb: 1,
                  }}
                >
                  {readOnly ? "Selon " : "Ajustez "} vos créneaux d'heures
                  creuses
                </Typography>
                {!readOnly && (
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontSize: "0.875rem",
                      color: "text.secondary",
                      opacity: 0.8,
                    }}
                  >
                    Cliquez sur les créneaux pour les ajouter ou les retirer
                  </Typography>
                )}
              </Box>
            </Zoom>

            {isDesktop && (
              <Zoom
                in={isLoaded}
                timeout={800}
                style={{ transitionDelay: "400ms" }}
              >
                <Box>
                  <Box
                    display="flex"
                    borderRadius={3}
                    overflow="hidden"
                    sx={{
                      m: 2,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      background: "rgba(255,255,255,0.05)",
                      backdropFilter: "blur(10px)",
                      position: "relative",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
                        pointerEvents: "none",
                      },
                    }}
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
                          py={1.5}
                          position="relative"
                          sx={{
                            background: isHC
                              ? "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)"
                              : "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
                            borderRight:
                              i !== 47
                                ? "1px solid rgba(255,255,255,0.2)"
                                : "none",
                            minWidth: 15,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            transform:
                              hoveredSlot === i ? "scale(1.05)" : "scale(1)",
                            zIndex: hoveredSlot === i ? 2 : 1,
                            ...(readOnly
                              ? {}
                              : {
                                  "&:hover": {
                                    background: isHC
                                      ? "linear-gradient(135deg, #66BB6A 0%, #81C784 100%)"
                                      : "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                                    transform: "scale(1.05)",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                  },
                                  cursor: "pointer",
                                }),
                          }}
                          onClick={() => !readOnly && toggleTimeSlot(i)}
                          onMouseEnter={() => !readOnly && setHoveredSlot(i)}
                          onMouseLeave={() => !readOnly && setHoveredSlot(null)}
                        >
                          {i % 2 === 0 ? (
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color: isHC ? "white" : "text.primary",
                                textShadow: isHC
                                  ? "0 1px 2px rgba(0,0,0,0.3)"
                                  : "none",
                              }}
                            >
                              {Math.floor(i / 2)
                                .toString()
                                .padStart(2, "0")}
                            </Typography>
                          ) : (
                            <Typography variant="caption"></Typography>
                          )}

                          {hoveredSlot === i && !readOnly && (
                            <Zoom in={true} timeout={200}>
                              <Box
                                position="absolute"
                                top="50%"
                                left="50%"
                                sx={{
                                  transform: "translate(-50%, -50%)",
                                  background: "rgba(255,255,255,0.95)",
                                  borderRadius: "50%",
                                  p: 0.5,
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                  backdropFilter: "blur(10px)",
                                }}
                              >
                                <IconButton
                                  size="small"
                                  sx={{
                                    maxWidth: 24,
                                    color: isHC ? "error.main" : "primary.main",
                                    "&:hover": {
                                      transform: "scale(1.1)",
                                      transition: "transform 0.2s ease",
                                    },
                                  }}
                                >
                                  {isHC ? (
                                    <DeleteIcon fontSize="small" />
                                  ) : (
                                    <AddIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </Box>
                            </Zoom>
                          )}
                        </Box>
                      );
                    })}
                  </Box>

                  <Zoom
                    in={isLoaded}
                    timeout={1000}
                    style={{ transitionDelay: "600ms" }}
                  >
                    <Box
                      display="flex"
                      gap={2}
                      sx={{
                        justifyContent: "center",
                        alignItems: "center",
                        mb: 2,
                        width: "100%",
                      }}
                    >
                      <Chip
                        icon={<NightsStayIcon />}
                        label="Heures creuses"
                        color="success"
                        sx={{
                          background:
                            "linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)",
                          color: "white",
                          fontWeight: 600,
                          boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
                            transition: "all 0.3s ease",
                          },
                        }}
                      />
                      <Chip
                        icon={<LightModeIcon />}
                        label="Heures pleines"
                        sx={{
                          background:
                            "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
                          color: "text.primary",
                          fontWeight: 600,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            transition: "all 0.3s ease",
                          },
                        }}
                      />
                    </Box>
                  </Zoom>

                  <Zoom
                    in={isLoaded}
                    timeout={1200}
                    style={{ transitionDelay: "800ms" }}
                  >
                    <Alert
                      severity="warning"
                      sx={{
                        m: 1,
                        textAlign: "justify",
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                        border: "1px solid #ffb74d",
                        boxShadow: "0 2px 8px rgba(255, 183, 77, 0.2)",
                        "& .MuiAlert-icon": {
                          color: "#f57c00",
                        },
                      }}
                    >
                      Certaines options (
                      <AccessTimeFilledIcon
                        sx={{
                          fontSize: "1rem",
                          verticalAlign: "middle",
                          color: "#f57c00",
                          animation: "pulse 2s infinite",
                          "@keyframes pulse": {
                            "0%": { opacity: 1 },
                            "50%": { opacity: 0.7 },
                            "100%": { opacity: 1 },
                          },
                        }}
                      />
                      ) imposent des heures creuses, votre sélection{" "}
                      {readOnly ? "n'a pas été" : "ne sera pas"} prise en compte
                      sur ces options
                    </Alert>
                  </Zoom>
                </Box>
              </Zoom>
            )}

            {!isDesktop && !readOnly && (
              <Zoom
                in={isLoaded}
                timeout={1400}
                style={{ transitionDelay: "1000ms" }}
              >
                <Alert
                  severity="warning"
                  sx={{
                    m: 1,
                    textAlign: "justify",
                    borderRadius: 2,
                    background:
                      "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
                    border: "1px solid #ffb74d",
                    boxShadow: "0 2px 8px rgba(255, 183, 77, 0.2)",
                  }}
                >
                  Seulement sur ordinateur
                </Alert>
              </Zoom>
            )}
          </Stack>
        )}
      </Box>
    </Fade>
  );
};

export default HpHcSlotSelector;
