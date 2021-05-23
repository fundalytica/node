export default class UITableUtils {
    static clearTable(table) {
        $(`${table} thead`).empty()
        $(`${table} tbody`).empty()
    }

    static clearTables(tables) {
        for (const table of tables) {
            UITableUtils.clearTable(table)
        }
    }

    static addHeader(table, values) {
        let row = '<tr>'

        for (const value of values) {
            row += `<th>${value}</th>`
        }

        row += '</tr>'

        $(`${table} > thead`).append(row)
    }

    static addRow(table, values) {
        let row = '<tr>'

        for (let i = 0; i < values.length; i++) {
            const value = values[i]

            row += `<td>${value}</td>`
        }

        row += '</tr>'

        $(`${table} > tbody:last-child`).append(row)
    }

    static hideColumns(table, header, hide) {
        for (const column of hide) {
            const nColumn = header.indexOf(column) + 1
            $(`${table} tr th:nth-child(${nColumn})`).addClass('d-none')
            $(`${table} tr td:nth-child(${nColumn})`).addClass('d-none')
        }
    }

    static headerList(table) {
        const list = []

        const trElements = document.querySelectorAll(`${table} > thead > tr`)
        const tr = trElements[0]

        const thElements = tr.getElementsByTagName('th')
        for (const element of thElements) {
            list.push(element.innerText)
        }

        return list
    }

    static findRowIndex(table, columnIndex, value) {
        const trElements = document.querySelectorAll(`${table} > tbody > tr`)

        for (let i = 0; i < trElements.length; i++) {
            const tr = trElements[i]
            const tdElements = tr.getElementsByTagName('td')
            const td = tdElements[columnIndex]

            if (td.innerText == value) {
                return i
            }
        }

        return -1
    }

    static updateValue(table, rowIndex, columnIndex, value, method) {
        const rows = document.querySelectorAll(`${table} > tbody > tr`)
        const row = rows[rowIndex]

        const column = row.querySelector(`td:nth-child(${columnIndex + 1})`)

        method($(column), value)
    }

    static addDataTitle(table, header) {
        const trElements = document.querySelectorAll(`${table} > tbody > tr`)

        for (let i = 0; i < trElements.length; i++) {
            const tr = trElements[i]
            const tdElements = tr.getElementsByTagName('td')

            for (let j = 0; j < tdElements.length; j++) {
                const td = tdElements[j]

                const key = header[j]
                td.setAttribute("data-title", key)
            }
        }
    }
}