import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

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
import { format } from "date-fns";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../context/FormContext";

import allOffersFile from "../statics/price_mapping.json";
import { PriceMappingFile } from "../types";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
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
  })
);

export function ComparisonTable() {
  const { formState, setFormState } = useFormContext();
  const allOffers = allOffersFile as PriceMappingFile;
  const navigate = useNavigate();

  React.useEffect(() => {
    const dateRange = formState.analyzedDateRange;

    console.log("ComparisonTable useEffect - État actuel:", {
      dateRange: !!dateRange,
      parsedData: !!formState.parsedData,
      hpHcConfig: !!formState.hpHcConfig,
      rowSummaries: formState.rowSummaries?.length || 0,
      isGlobalLoading: formState.isGlobalLoading,
    });

    if (
      !dateRange ||
      !formState.parsedData ||
      !formState.hpHcConfig ||
      !formState.rowSummaries
    ) {
      console.log("navigate to step 0 from comparison table");
      console.log("dateRange", dateRange);
      console.log("parsedData", formState.parsedData);
      console.log("hpHcConfig", formState.hpHcConfig);
      console.log("rowSummaries", formState.rowSummaries);
      navigate("?step=0");
      return;
    }

    // Les calculs sont maintenant pré-calculés dans ModernDataImport
    // On vérifie juste que les données sont présentes
    if (!formState.rowSummaries || formState.rowSummaries.length === 0) {
      console.log("Aucune donnée de simulation disponible");
      return;
    }

    console.log(
      "Affichage des simulations pré-calculées:",
      formState.rowSummaries.length,
      "offres"
    );
  }, [
    formState.analyzedDateRange,
    formState.parsedData,
    formState.rowSummaries,
  ]);

  const currentOfferTotal =
    formState.rowSummaries.find(
      (row) =>
        row.offerType === formState.offerType &&
        row.optionKey === formState.optionType
    )?.total ?? 0;

  const getColorForPercentage = (percentage: number) => {
    if (percentage === 0) {
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
      !formState.rowSummaries ||
      formState.rowSummaries.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress thickness={8} size={60} />
          <Typography sx={{ ml: 2, alignSelf: "center" }}>
            {formState.isGlobalLoading
              ? "Calcul des simulations..."
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
            {formState.rowSummaries
              .sort((a, b) => {
                return a.total - b.total;
              })
              .filter((row) => row?.total > 0)
              .map((row) => (
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
                        title={`Tarification mise à jour le ${format(
                          row.lastUpdate,
                          "dd/MM/yyyy"
                        )}`}
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
                          sx={{ fontSize: "1rem", verticalAlign: "text-top" }}
                        />
                      </Link>
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {new Intl.NumberFormat("fr-FR").format(
                      row.fullSubscriptionCost
                    )}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {new Intl.NumberFormat("fr-FR").format(
                      row.totalConsumptionCost
                    )}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {new Intl.NumberFormat("fr-FR").format(row.total)}
                  </StyledTableCell>
                  <StyledTableCell
                    align="center"
                    style={{
                      color: getColorForPercentage(
                        (100 * (row.total - currentOfferTotal)) / row.total
                      ),
                    }}
                  >
                    {Math.round(
                      (100 * (row.total - currentOfferTotal)) / row.total
                    ) > 0
                      ? "+"
                      : ""}
                    {Math.round(
                      (100 * (row.total - currentOfferTotal)) / row.total
                    )}{" "}
                    %
                  </StyledTableCell>
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
}
