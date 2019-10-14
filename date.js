const dateString = dateInput => {
  const currentDate = new Date(dateInput);
  const date = (currentDate.getDate() < 10 ? '0' : '') + currentDate.getDate();
  const month = ((currentDate.getMonth() + 1) < 10 ? '0': '') + (currentDate.getMonth()+1);
  const year = currentDate.getFullYear();
  let dateString = (year + "-" +month+ "-" + date).toString();

  return dateString;
}

module.exports = {dateString};