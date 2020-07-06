
const daysToEndOfMonth = (date) => {
    const lastOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() 
    const daysBetween = lastOfMonth - date.getDate()

    return daysBetween
}

const incrementDateToEndOfMonth = (i, date) => {
    
    console.log("Increment", date)
    date.setDate(date.getDate() + i)
    
    return date
}

const todaysDate = () => {
    //Päivitetään aika UTC +2 aikavyöhykkeelle sopimaan Suomen kellolle
    const timezonedDate = new Date()
    timezonedDate.setHours(24)
    timezonedDate.setMinutes(0)
    timezonedDate.setSeconds(0)
    timezonedDate.setMilliseconds(0)

    return timezonedDate
   

}
module.exports = {
    daysToEndOfMonth,
    incrementDateToEndOfMonth,
    todaysDate
}


