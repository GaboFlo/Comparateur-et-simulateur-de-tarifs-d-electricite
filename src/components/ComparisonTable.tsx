import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { CircularProgress, Link, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";
import { useNavigate } from "react-router";
import { useFormContext } from "../context/FormContext";
import { calculateRowSummary } from "../scripts/calculators";
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
  highlight: boolean;
}

const StyledTableRow = styled(TableRow)<StyledTableRowProps>(
  ({ theme, highlight }) => ({
    backgroundColor: highlight ? theme.palette.primary.light : "inherit",
  })
);

export function ComparisonTable() {
  const { formState, setFormState } = useFormContext();
  const allOffers = allOffersFile as PriceMappingFile;
  const navigate = useNavigate();

  React.useEffect(() => {
    const dateRange = formState.analyzedDateRange; //TODO : check if this is the right date range

    if (
      !dateRange ||
      !formState.parsedData ||
      !formState.hpHcConfig ||
      !formState.rowSummaries
    ) {
      navigate("?step=0");
      return;
    } else {
      setFormState((prevState) => ({
        ...prevState,
        isGlobalLoading: true,
      }));
    }

    for (const option of allOffers) {
      const costForOption = calculateRowSummary({
        data: formState.parsedData,
        dateRange,
        powerClass: formState.powerClass,
        optionKey: option.optionKey,
        offerType: option.offerType,
        optionName: option.optionName,
        provider: option.provider,
        link: option.link,
        hpHcData: formState.hpHcConfig,
        overridingHpHcKey: option.overridingHpHcKey,
      });
      if (
        !formState.rowSummaries.some(
          (summary) => summary.optionKey === costForOption.optionKey
        )
      ) {
        setFormState((prevState) => ({
          ...prevState,
          rowSummaries: prevState.rowSummaries.concat(costForOption),
        }));
      }
    }
    setFormState((prevState) => ({
      ...prevState,
      isGlobalLoading: false,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allOffers, formState.analyzedDateRange, formState.parsedData]);

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
      {formState.isGlobalLoading || !formState.rowSummaries ? (
        <CircularProgress />
      ) : (
        <>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell align="center">Fournisseur </StyledTableCell>
                <StyledTableCell align="center">
                  Offre - Option{" "}
                </StyledTableCell>
                <StyledTableCell align="center">
                  Abonnements (€)
                </StyledTableCell>
                <StyledTableCell align="center">
                  Coût de votre consommation (€)
                </StyledTableCell>
                <StyledTableCell align="center">
                  Total simulé (sans taxes, €)
                </StyledTableCell>
                <StyledTableCell align="center">
                  % de différence
                </StyledTableCell>
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
                    highlight={
                      row.offerType === formState.offerType &&
                      row.optionKey === formState.optionType
                    }
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
        </>
      )}
    </TableContainer>
  );
}
