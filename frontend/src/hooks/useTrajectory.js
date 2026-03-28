// Temporary mock hook so the old PatientHomePage compiles during Phase 2 review.
export function useTrajectory(historyResponse, surgeryType) {
  return {
    chartData: [],
    feverRiskDays: []
  };
}

export default useTrajectory;
