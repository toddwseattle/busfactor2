export const formatDate = (dateText: string | null): string => {
  if (dateText === null) {
    return "--";
  }

  return dateText.slice(0, 10);
};

export const formatPercent = (value: number): string => {
  if (Number.isInteger(value)) {
    return `${value}%`;
  }

  return `${value.toFixed(2).replace(/\.?0+$/, "")}%`;
};
