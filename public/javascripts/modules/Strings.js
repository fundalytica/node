export default class Strings {
    static range(from, to) {
        const format = "D MMM 'YY"

        const fromDate = moment(from)
        const toDate = moment(to)

        const diff = toDate.diff(fromDate)
        const years = moment.duration(diff).asYears()

        return `${fromDate.format(format)} to ${toDate.format(format)} (${years.toFixed(1)} Years)`
    }
}