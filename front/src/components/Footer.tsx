import { Box, Link } from "@mui/material";

export default function Footer() {
  return (
    <Box component="footer" sx={{ m: 1, textAlign: "center", width: "100%" }}>
      <p>
        &copy; 2025{" "}
        <Link href="https://gaboflo.fr" underline="hover">
          GaboFlo{" "}
        </Link>{" "}
        - Tous droits réservés -{" "}
        <Link href="https://buymeacoffee.com/gaboflo" underline="hover">
          Me soutenir
        </Link>{" "}
        -{" "}
        <Link
          href="https://github.com/GaboFlo/ComparateurFournisseurElectricity"
          underline="hover"
        >
          GitHub
        </Link>
      </p>
    </Box>
  );
}
