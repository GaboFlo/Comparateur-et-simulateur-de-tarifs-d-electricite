import { Box, CircularProgress } from "@mui/material";
import React, { Suspense, lazy } from "react";

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="200px"
  >
    <CircularProgress thickness={4} />
  </Box>
);

export const LazyLoader: React.FC<LazyLoaderProps> = ({
  children,
  fallback = <DefaultFallback />,
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

// Composants lazy pour les pages principales
export const LazyComparisonTable = lazy(() =>
  import("./ComparisonTable").then((module) => ({
    default: module.ComparisonTable,
  }))
);
export const LazyHourlySeasonChart = lazy(() => import("./HourlySeasonChart"));
export const LazyHpHcSeasonChart = lazy(() => import("./HpHcSeasonChart"));
export const LazySimulations = lazy(() => import("./Simulations"));

export default LazyLoader;
