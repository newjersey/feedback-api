export const dateResolver = (date) => {
  if (isNaN(Number(date))) {
    // string dates
    return new Date(date);
  } else if (!isNaN(Number(date)) && date.length === 13) {
    // 1715199952000
    return new Date(Number(date));
  } else if (!isNaN(Number(date)) && date.length === 10) {
    // 1715199952
    return new Date(Number(date) * 1000);
  }
};

export const isDateInRange = (startDateRange, endDateRange, commentDate) => {
  const resolvedStart = dateResolver(startDateRange);
  const resolvedEnd = dateResolver(endDateRange);
  const resolvedDate = dateResolver(commentDate);

  if (startDateRange === undefined && endDateRange === undefined) {
    return true;
  }

  if (startDateRange !== undefined && endDateRange !== undefined) {
    return resolvedDate >= resolvedStart && resolvedDate <= resolvedEnd
  }

  if (startDateRange === undefined) {
    return resolvedDate <= resolvedEnd;
  }

  if (endDateRange === undefined) {
    return resolvedDate >= resolvedStart;
  }
};