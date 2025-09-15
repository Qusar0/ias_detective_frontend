export const getItemDate = (date) => {
  return (
      `${date.format('h:i')}, ${date.format('d.m.Y')}`
  ).trim();
};