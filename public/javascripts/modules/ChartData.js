export default class ChartData {
    dataToSeries(data) {
        // [ [x,y], ... , [x,y] ]
        return Object.keys(data).map(key => [parseInt(key), data[key]])
    }

    dipDataFilter(dipCloseData, dipPercentageData, percentage) {
        const dipPercentage = Object.keys(dipPercentageData)
            .filter(key => dipPercentageData[key] <= percentage )
            .reduce((obj, key) => { obj[key] = dipPercentageData[key]; return obj }, {})

        const dipClose = Object.keys(dipPercentage)
            .reduce((obj, key) => { obj[key] = dipCloseData[key]; return obj }, {})

        return dipClose
    }
}