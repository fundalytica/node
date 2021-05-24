export default class StringUtils {
    static capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    }

    static range(from, to, format) {
        const fromDate = moment(from)
        const toDate = moment(to)

        const diff = toDate.diff(fromDate)
        const years = moment.duration(diff).asYears()

        return `${fromDate.format(format)} to ${toDate.format(format)} (${years.toFixed(1)} Years)`
    }
}