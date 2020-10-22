var express = require('express')
var router = express.Router()

const topics = [
  {   id: 'dip',
      color: '#f55a5a',
      image: 'dip.svg',
      title: 'S&P 500 Dip',
      description: 'We are looking out for the next S&P 500 dip because we love investing at low prices. Do not miss it!',
      button: 'Buy The Dip 📉',
      action: 'route',
      hashtag: 'tool' },

  {   id: 'qqq',
      color: '#AD5D9D',
      image: 'invesco.svg',
      title: 'QQQ ETF Holdings',
      description: 'All the great companies included in the Invesco QQQ ETF (NASDAQ 100).',
      button: 'View Stock Data',
      action: 'route',
      hashtag: 'etf' },

  {   id: 'norway',
      color: '#409ECD',
      image: 'norges.png',
      title: 'Government Pension Fund Global',
      description: 'We dive into annual reports and analyze one of the largest pension funds in the world.',
      button: 'View Top Holdings',
      action: 'route',
      hashtag: 'institution' }

router.get('/', (req, res) => res.render('index', { topics }))
router.get('/sc', (req, res) => res.render('index', { topics: topics, subscribe: 'confirm' })) // subscription confirm
router.get('/ss', (req, res) => res.render('index', { topics: topics, subscribe: 'success' })) // subscription success

module.exports = router