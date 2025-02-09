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
        &copy; 2025 Tous droits réservés
        <button
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            marginLeft: "0.1rem",
          }}
          onClick={() => {
            window.open(
              "https://github.com/GaboFlo/ComparateurFournisseurElectricity",
              "_blank",
              "noopener"
            );
          }}
        >
          <img
            src="./github.svg"
            alt="GitHub"
            style={{
              marginLeft: "0.5rem",
              marginRight: "0.5rem",
              height: "1.1rem",
              backgroundColor: "white",
              borderRadius: "2px",
            }}
          />
        </button>
        <Link
          href="https://buymeacoffee.com/gaboflo"
          underline="hover"
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: "inline-flex", alignItems: "center" }}
        >
          🎉 Me soutenir 🎉
        </Link>{" "}
        <img
          src="https://licensebuttons.net/l/by-nc-sa/4.0/88x31.png"
          alt="Licence CC BY-NC-SA"
          style={{ marginLeft: "0.5rem" }}
        />
        {APP_VERSION}
      </p>
    </Box>
  );
}
