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
import {
  calculateForAllOptions,
  fetchTempoData,
} from "../services/calculators";
import { CalculatedData, ComparisonTableInterfaceRow } from "../types";

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

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number,
  protein: number
) {
  return { name, calories, fat, carbs, protein };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
];

export function ComparisonTable() {
  const { formState } = useFormContext();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allData, setAllData] = useState<CalculatedData[] | null>(null);
  const [summarizedData, setSummarizedData] = useState<
    ComparisonTableInterfaceRow[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const tempoDates = await fetchTempoData();

      const result = await calculateForAllOptions({
        data: formState.consumptionData.slice(0, 10),
        dateRange: formState.dateRange,
        powerClass: formState.powerClass,
        tempoDates,
      });
      setAllData(result.fullData);
      setSummarizedData(result.summarizedData);
      setLoading(false);
    }

    fetchData();
  }, [formState]);

  // eslint-disable-next-line no-console
  console.log(loading, summarizedData[0]);

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Fournisseur</StyledTableCell>
            <StyledTableCell align="right">Offre</StyledTableCell>
            <StyledTableCell align="right">
              Simulation consommation (€)
            </StyledTableCell>
            <StyledTableCell align="right">
              Abonnement mensuel (€)
            </StyledTableCell>
            <StyledTableCell align="right">
              Total sur la période (sans taxes)
            </StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && <LinearProgress />}
          {!loading &&
            rows.map((row) => (
              <StyledTableRow key={row.name}>
                <StyledTableCell component="th" scope="row">
                  {row.name}
                </StyledTableCell>
                <StyledTableCell align="right">{row.calories}</StyledTableCell>
                <StyledTableCell align="right">{row.fat}</StyledTableCell>
                <StyledTableCell align="right">{row.carbs}</StyledTableCell>
                <StyledTableCell align="right">{row.protein}</StyledTableCell>
              </StyledTableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
