import Utils from './Utils.js'

export default class ChartStrings {

    static priceChangeString(data, timestamp) {
        timestamp = parseInt(timestamp)
        const timestampKeys = Object.keys(data).sort().reverse().map(k => parseInt(k))

        const index = timestampKeys.indexOf(timestamp)
        const price = data[timestamp]

        if(index < timestampKeys.length - 1) {
            const previousTimestamp = timestampKeys[index + 1]
            const previousPrice = data[previousTimestamp]
            const percentage = (price / previousPrice) - 1
            return numeral(percentage).format('%0,0.0')
        }

        return '-'
    }

    static afterDaysString(data, timestamp) {
        timestamp = parseInt(timestamp)
        const timestampKeys = Object.keys(data).sort().reverse().map(k => parseInt(k))

        const index = timestampKeys.indexOf(timestamp)
        const date = moment.unix(timestamp / 1000)

        if(index < timestampKeys.length - 1) {
            const previousTimestamp = timestampKeys[index + 1]
            const previousDate = moment.unix(previousTimestamp / 1000)
            const diff = date.diff(previousDate)
            const days = moment.duration(diff).asDays()
            return `${numeral(days).format(',')} ${days > 1 ? 'days' : 'day'}`
        }

        return '-'
    }
}