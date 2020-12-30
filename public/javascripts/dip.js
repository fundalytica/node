import Chart from './modules/Chart.js'
import Strings from './modules/Strings.js'

const chart = new Chart('chart')
const strings = new Strings()

const fetch = options => {
    const url = `https://api.fundalytica.com/v1/historical/dip/${options.symbol}-${options.minimumDip}`

    $('#title').text(`${options.symbol} Dips`)
    $('#subtitle').text(`-${options.defaultDip}% or worse`)
    $("#spinner").removeClass('d-none')

    $.ajax({
        url: url,
        success: data => {
            $("#spinner").addClass('d-none')

            if(data.error) {
                $('#error').text(`${options.symbol} market data is currently not available`)
            }
            else {
                $('#dates').text(strings.range(data.dates.from, data.dates.to))

                chart.addSeries(data.all.close)
                chart.addATHSeries(data.ath.close)
                chart.addDipSeries(data.dip.close, data.dip.dip)
                chart.show()

                const sliderInputChanged = event => {
                    const value = event.target.value
                    const percentage = -(value / 100)
                    $('#subtitle').text(`-${value}% or worse`)
                    chart.updateDipPercentage(data.dip.close, data.dip.dip, percentage)
                }
                $('#slider').val(options.defaultDip)
                $('#slider').on("input change", sliderInputChanged)
                $("#slider").removeClass('d-none')
            }
        }
    })
}

$(fetch({ symbol: 'SNAP', minimumDip: 5, defaultDip: 10 }))