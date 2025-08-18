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

// Composant pour l'affichage du fournisseur
const ProviderCell = ({ provider }: { provider: string }) => (
  <StyledTableCell
    align="center"
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <img src={`/${provider}.png`} alt={provider} width="24" height="24" />{" "}
    <Typography variant="body1" m={1}>
      {provider}
    </Typography>
  </StyledTableCell>
);

// Composant pour l'affichage de l'offre
const OfferCell = ({ row }: { row: ComparisonTableInterfaceRow }) => (
  <StyledTableCell
    align="center"
    style={{
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <Typography variant="body1" m={1}>
      <Tooltip
        title={`Tarification mise à jour le ${dayjs(row.lastUpdate).format(
          "DD/MM/YYYY"
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
          sx={{
            fontSize: "1rem",
            verticalAlign: "text-top",
          }}
        />
      </Link>
    </Typography>
  </StyledTableCell>
);

// Composant pour l'affichage des coûts
const CostCell = ({ value }: { value: number }) => (
  <StyledTableCell align="center">
    {new Intl.NumberFormat("fr-FR").format(
      typeof value === "number" && isFinite(value) ? value : 0
    )}
  </StyledTableCell>
);

// Composant pour l'affichage du pourcentage
const PercentageCell = ({
  row,
  safeCurrentOfferTotal,
}: {
  row: ComparisonTableInterfaceRow;
  safeCurrentOfferTotal: number;
}) => {
  const getColorForPercentage = (percentage: number) => {
    if (percentage === 0 || isNaN(percentage) || !isFinite(percentage)) {
      return "inherit";
    }
    return percentage >= 0 ? "red" : "green";
  };

  const calculatePercentage = () => {
    if (!row.total || row.total <= 0) return 0;
    return (100 * (row.total - safeCurrentOfferTotal)) / row.total;
  };

  const percentage = calculatePercentage();
  const roundedPercentage = Math.round(percentage);

  return (
    <StyledTableCell
      align="center"
      style={{
        color: getColorForPercentage(percentage),
      }}
    >
      {`${roundedPercentage > 0 ? "+" : ""}${roundedPercentage} %`}
    </StyledTableCell>
  );
};

// Composant pour une ligne du tableau
const TableRowComponent = ({
  row,
  formState,
  safeCurrentOfferTotal,
}: {
  row: ComparisonTableInterfaceRow;
  formState: ReturnType<typeof useFormContext>["formState"];
  safeCurrentOfferTotal: number;
}) => (
  <StyledTableRow
    key={`${row.provider}-${row.offerType}-${row.optionKey}`}
    highlight={(
      row.offerType === formState.offerType &&
      row.optionKey === formState.optionType
    ).toString()}
  >
    <ProviderCell provider={row.provider} />
    <OfferCell row={row} />
    <CostCell value={row.fullSubscriptionCost} />
    <CostCell value={row.totalConsumptionCost} />
    <CostCell value={row.total} />
    <PercentageCell row={row} safeCurrentOfferTotal={safeCurrentOfferTotal} />
  </StyledTableRow>
);

// Composant pour l'état de chargement
const LoadingState = ({
  formState,
}: {
  formState: ReturnType<typeof useFormContext>["formState"];
}) => (
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
);

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

  const shouldShowLoading = () => {
    return (
      formState.isGlobalLoading ||
      !Array.isArray(formState.rowSummaries) ||
      formState.rowSummaries.length === 0
    );
  };

  const renderTableContent = () => {
    if (shouldShowLoading()) {
      return <LoadingState formState={formState} />;
    }

    return (
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
          {processTableData(formState.rowSummaries).map((row) => (
            <TableRowComponent
              key={`${row.provider}-${row.offerType}-${row.optionKey}`}
              row={row}
              formState={formState}
              safeCurrentOfferTotal={safeCurrentOfferTotal}
            />
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <TableContainer component={Paper} sx={{ my: 3 }}>
      {renderTableContent()}
    </TableContainer>
  );
}

export default ComparisonTable;
