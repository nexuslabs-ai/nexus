export const CHART_CATEGORICAL_SERIES = ['1', '2', '3', '4', '5'] as const;
export type ChartCategoricalIndex = (typeof CHART_CATEGORICAL_SERIES)[number];
