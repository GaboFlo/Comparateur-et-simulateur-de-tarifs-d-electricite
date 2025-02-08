import { Box, Link } from "@mui/material";
import { APP_VERSION } from "../types";

export default function Footer() {
  return (
    <Box component="footer" sx={{ m: 1, textAlign: "center", width: "100%" }}>
      <p
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          whiteSpace: "nowrap",
          gap: "1rem",
        }}
      >
        &copy; 2025 ({APP_VERSION})
        <Link
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          underline="hover"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: "inline-flex", alignItems: "center", ml: 1, mr: 1 }}
        >
          GaboFlo
        </Link>{" "}
        Tous droits réservés{" "}
        <Link
          href="https://buymeacoffee.com/gaboflo"
          underline="hover"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: "inline-flex", alignItems: "center" }}
        >
          🎉 Me soutenir 🎉
        </Link>{" "}
        <Link
          href="https://github.com/GaboFlo/ComparateurFournisseurElectricity"
          underline="hover"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: "inline-flex", alignItems: "center" }}
        >
          <img
            src="./github.svg"
            alt="GitHub"
            style={{
              marginRight: "0.5rem",
              height: "1.1rem",
              backgroundColor: "white",
              borderRadius: "2px",
            }}
          />
          GitHub
        </Link>
        <img
          src="https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png"
          alt="Licence CC BY-NC-SA"
          style={{ marginLeft: "0.5rem" }}
        />
      </p>
    </Box>
  );
}
