import { LinearProgress } from "@mui/material";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useEffect, useState } from "react";

import { useFormContext } from "../context/FormContext";
import { postSimulation } from "../services/httpCalls";
import { ComparisonTableInterfaceRow } from "../types";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export function ComparisonTable() {
  const { formState } = useFormContext();
  const [summarizedData, setSummarizedData] = useState<
    ComparisonTableInterfaceRow[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await postSimulation({
        data: formState.consumptionData,
        dateRange: formState.dateRange ??
          formState.fileDateRange ?? [new Date(), new Date()],
        powerClass: formState.powerClass,
      });
      setSummarizedData(res);
      setLoading(false);
      return res;
    };

    fetchData();
  }, [formState.dateRange]);
  return (
    <TableContainer component={Paper}>
      {loading ? (
        <LinearProgress />
      ) : (
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Fournisseur</StyledTableCell>
              <StyledTableCell align="right">Offre</StyledTableCell>
              <StyledTableCell align="right">Option</StyledTableCell>
              <StyledTableCell align="right">
                Simulation consommation (€)
              </StyledTableCell>
              <StyledTableCell align="right">
                Abonnement mensuel (€)
              </StyledTableCell>
              <StyledTableCell align="right">
                Total sur la période (sans taxes, €)
              </StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {summarizedData.map((row) => (
              <StyledTableRow
                key={`${row.provider}-${row.offerType}-${row.optionName}`}
              >
                <StyledTableCell component="th" scope="row">
                  {row.provider}
                </StyledTableCell>
                <StyledTableCell component="th" scope="row">
                  {row.offerType}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {row.optionName}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {row.totalConsumptionCost}
                </StyledTableCell>
                <StyledTableCell align="right">
                  {row.monthlyCost}
                </StyledTableCell>
                <StyledTableCell align="right">{row.total}</StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
}
