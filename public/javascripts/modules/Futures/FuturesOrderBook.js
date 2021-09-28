// export default class FuturesOrderBook {
//     constructor(bids, asks) {
//         this.bids = bids
//         this.asks = asks
//     }

//     total(entries) {
//         return entries.reduce((acc, val) => acc += val.qty, 0)
//     }

//     spread() {
//         if(this.bids.length && this.asks.length) {
//             // highest buying price
//             const bestBid = this.bids[0].price

//             // lowest asking price
//             const bestAsk = this.asks[0].price

//             const amount = (bestAsk - bestBid).toFixed(2)
//             const pct = (amount / bestAsk * 100).toFixed(2)

//             return { amount, pct }
//         }
//     }

//     print() {
//         console.table(this.bids)
//         console.log(`${this.bids.length} bids, ${this.total(this.bids)} total`)
//         console.table(this.asks)
//         console.log(`${this.asks.length} asks, ${this.total(this.asks)} total`)
//     }
// }