import UIUtils from './UIUtils.js'

export default class UITableUtils {
    static clearTable(table) {
        UIUtils.empty(`${table} thead`)
        UIUtils.empty(`${table} tbody`)
    }

    static clearTables(tables) {
        for (const table of tables) {
            UITableUtils.clearTable(table)
        }
    }

    static addHeader(table, values) {
        const tableHeadRef = document.querySelector(`${table} > thead`)
        const newRow = tableHeadRef.insertRow()

        for (const value of values) {
            const th = document.createElement("th")

            const text = document.createTextNode(value)
            th.appendChild(text)

            newRow.appendChild(th)
        }
    }

    static addRow(table, values) {
        const tableBodyRef = document.querySelector(`${table} > tbody`)
        const newRow = tableBodyRef.insertRow()

        for (let i = 0; i < values.length; i++) {
            const newCell = newRow.insertCell()

            if(typeof(values[i])== 'string') {
                newCell.innerText = values[i]
            }

            if(typeof(values[i])== 'object') {
                newCell.appendChild(values[i])
            }
        }
    }

    static hideColumns(table, header, hide) {
        for (const column of hide) {
            const nColumn = header.indexOf(column) + 1

            UIUtils.hide(`${table} tr th:nth-child(${nColumn})`)
            UIUtils.hide(`${table} tr td:nth-child(${nColumn})`)
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
        const selector = `${table} > tbody > tr:nth-child(${rowIndex + 1}) > td:nth-child(${columnIndex + 1})`
        method(selector, value)
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