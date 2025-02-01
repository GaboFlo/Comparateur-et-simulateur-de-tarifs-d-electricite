import { CircularProgress, LinearProgress } from "@mui/material";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import React from "react";
import { useFormContext } from "../context/FormContext";
import { getStreamedData } from "../services/httpCalls";
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
  const [rowSummaries, setRowSummaries] = React.useState<
    ComparisonTableInterfaceRow[]
  >([]);
  const [eventSource, setEventSource] = React.useState<EventSource | null>(
    null
  );

  const [loading, setLoading] = React.useState(false);
  React.useEffect(() => {
    const fetchData = async () => {
      if (!formState.fileId) {
        setRowSummaries([]);
        if (eventSource) {
          eventSource.close();
          setEventSource(null);
        }
        return;
      }

      setLoading(true);

      try {
        const url = await getStreamedData({
          fileId: formState.fileId,
          start: formState.dateRange[0],
          end: formState.dateRange[1],
          powerClass: formState.powerClass,
        });

        if (eventSource) {
          eventSource.close();
        }

        const newEventSource = new EventSource(url);
        setEventSource(newEventSource);

        newEventSource.onmessage = (event) => {
          try {
            const jsonData = JSON.parse(event.data);
            setRowSummaries((prevSummaries) => [
              ...prevSummaries,
              jsonData.comparisonRow,
            ]);
          } catch (jsonError) {
            // eslint-disable-next-line no-console
            console.error("Error parsing JSON:", jsonError, event.data);
            alert("Error parsing JSON"); // Set error state
            newEventSource.close();
            setEventSource(null);
          }
        };

        newEventSource.onerror = () => {
          newEventSource.close();
          setEventSource(null);
          setLoading(false);
        };
      } catch (error) {
        alert("Error fetching data"); // Set error state
        setLoading(false); // Stop loading on fetch error
      }
    };

    fetchData();
  }, []);

  return (
    <TableContainer component={Paper} sx={{ my: 3 }}>
      {formState.isGlobalLoading || !rowSummaries ? (
        <CircularProgress />
      ) : (
        <>
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
              {rowSummaries.map((row) => (
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
          {loading && <LinearProgress />}
        </>
      )}
    </TableContainer>
  );
}
