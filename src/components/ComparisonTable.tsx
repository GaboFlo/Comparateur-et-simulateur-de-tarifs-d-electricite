import {
  AccessTimeFilled as AccessTimeFilledIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import {
  Box,
  CircularProgress,
  Link,
  Tooltip,
  Typography,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import dayjs from "dayjs";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../context/FormContext";
import { ComparisonTableInterfaceRow } from "../types";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

interface StyledTableRowProps {
  highlight: string;
}

const StyledTableRow = styled(TableRow)<StyledTableRowProps>(
  ({ theme, highlight }) => ({
    backgroundColor:
      highlight === "true" ? theme.palette.primary.light : "inherit",
    transition: "background-color 0.2s ease-in-out",
    "&:hover": {
      backgroundColor:
        highlight === "true"
          ? theme.palette.primary.main
          : theme.palette.action.hover,
      cursor: "pointer",
    },
  })
);

// Fonction utilitaire pour traiter les données
const processTableData = (rowSummaries: ComparisonTableInterfaceRow[]) => {
  if (!Array.isArray(rowSummaries)) {
    return [];
  }

  const filteredRows = rowSummaries.filter(
    (row) =>
      row?.total &&
      typeof row.total === "number" &&
      isFinite(row.total) &&
      row.total > 0
  );

  return filteredRows.sort((a, b) => (a.total || 0) - (b.total || 0));
};

function ComparisonTable() {
  const { formState } = useFormContext();
  const navigate = useNavigate();

  React.useEffect(() => {
    const dateRange = formState.analyzedDateRange;

    if (
      !dateRange ||
      !formState.parsedData ||
      !formState.hpHcConfig ||
      !formState.rowSummaries
    ) {
      navigate("?step=0");
      return;
    }

    // Les calculs sont maintenant pré-calculés dans DataImport
    // On vérifie juste que les données sont présentes
    if (!formState.rowSummaries || formState.rowSummaries.length === 0) {
      return;
    }
  }, [
    formState.analyzedDateRange,
    formState.hpHcConfig,
    formState.parsedData,
    formState.rowSummaries,
    navigate,
  ]);

  // Protection contre les données invalides
  if (!formState || typeof formState !== "object") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <Typography>Erreur de chargement des données</Typography>
      </Box>
    );
  }

  // Validation de sécurité des données critiques
  if (!formState.rowSummaries || !Array.isArray(formState.rowSummaries)) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <Typography>Données de comparaison invalides</Typography>
      </Box>
    );
  }

  // Limitation du nombre de lignes pour éviter les problèmes de performance
  const MAX_ROWS = 1000;
  if (formState.rowSummaries.length > MAX_ROWS) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
        <Typography>
          Trop de données à afficher (maximum {MAX_ROWS} lignes)
        </Typography>
      </Box>
    );
  }

  const currentOfferTotal = Array.isArray(formState.rowSummaries)
    ? formState.rowSummaries.find(
        (row) =>
          row.offerType === formState.offerType &&
          row.optionKey === formState.optionType
      )?.total ?? 0
    : 0;

  // S'assurer que currentOfferTotal est un nombre valide
  const safeCurrentOfferTotal =
    typeof currentOfferTotal === "number" && isFinite(currentOfferTotal)
      ? currentOfferTotal
      : 0;

  const getColorForPercentage = (percentage: number) => {
    if (percentage === 0 || isNaN(percentage) || !isFinite(percentage)) {
      return "inherit";
    }
    if (percentage >= 0) {
      return "red";
    } else {
      return "green";
    }
  };

  return (
    <TableContainer component={Paper} sx={{ my: 3 }}>
      {formState.isGlobalLoading ||
      !Array.isArray(formState.rowSummaries) ||
      formState.rowSummaries.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: 6,
            minHeight: 300,
          }}
        >
          <CircularProgress thickness={8} size={60} />
          <Typography sx={{ mt: 2, textAlign: "center" }}>
            {formState.isGlobalLoading
              ? "Calcul des simulations en cours..."
              : "Aucune donnée de simulation disponible"}
          </Typography>
        </Box>
      ) : (
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell align="center">Fournisseur </StyledTableCell>
              <StyledTableCell align="center">Offre - Option </StyledTableCell>
              <StyledTableCell align="center">Abonnements (€)</StyledTableCell>
              <StyledTableCell align="center">
                Coût de votre consommation (€)
              </StyledTableCell>
              <StyledTableCell align="center">Total simulé (€)</StyledTableCell>
              <StyledTableCell align="center">% de différence</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(formState.rowSummaries)
              ? processTableData(formState.rowSummaries).map((row) => (
                  <StyledTableRow
                    key={`${row.provider}-${row.offerType}-${row.optionKey}`}
                    highlight={(
                      row.offerType === formState.offerType &&
                      row.optionKey === formState.optionType
                    ).toString()}
                  >
                    <StyledTableCell
                      align="center"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        src={`/${row.provider}.png`}
                        alt={row.provider}
                        width="24"
                        height="24"
                      />{" "}
                      <Typography variant="body1" m={1}>
                        {row.provider}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography variant="body1" m={1}>
                        <Tooltip
                          title={`Tarification mise à jour le ${dayjs(
                            row.lastUpdate
                          ).format("DD/MM/YYYY")}`}
                          arrow
                        >
                          <span
                            style={{
                              fontSize: "1rem",
                              verticalAlign: "middle",
                              cursor: "help",
                            }}
                          >
                            📅
                          </span>
                        </Tooltip>{" "}
                        {row.offerType && `${row.offerType} - `}
                        {row.optionName}{" "}
                        {row.overridingHpHcKey && (
                          <AccessTimeFilledIcon
                            sx={{
                              fontSize: "1rem",
                              verticalAlign: "middle",
                              color: "orange",
                            }}
                          />
                        )}{" "}
                        <Link
                          href={row.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          underline="none"
                        >
                          <OpenInNewIcon
                            sx={{
                              fontSize: "1rem",
                              verticalAlign: "text-top",
                            }}
                          />
                        </Link>
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {new Intl.NumberFormat("fr-FR").format(
                        typeof row.fullSubscriptionCost === "number" &&
                          isFinite(row.fullSubscriptionCost)
                          ? row.fullSubscriptionCost
                          : 0
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {new Intl.NumberFormat("fr-FR").format(
                        typeof row.totalConsumptionCost === "number" &&
                          isFinite(row.totalConsumptionCost)
                          ? row.totalConsumptionCost
                          : 0
                      )}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {new Intl.NumberFormat("fr-FR").format(
                        typeof row.total === "number" && isFinite(row.total)
                          ? row.total
                          : 0
                      )}
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      style={{
                        color: getColorForPercentage(
                          row.total && row.total > 0
                            ? (100 * (row.total - safeCurrentOfferTotal)) /
                                row.total
                            : 0
                        ),
                      }}
                    >
                      {(() => {
                        const percentage =
                          row.total && row.total > 0
                            ? (100 * (row.total - safeCurrentOfferTotal)) /
                              row.total
                            : 0;
                        const roundedPercentage = Math.round(percentage);
                        return `${
                          roundedPercentage > 0 ? "+" : ""
                        }${roundedPercentage} %`;
                      })()}
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              : null}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
}

export default ComparisonTable;
