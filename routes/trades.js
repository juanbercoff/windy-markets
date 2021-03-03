const router = require('express').Router();
const Trade  = require('../models/Trade');
const { tradeValidation } = require('../validation');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { startOfWeek, endOfWeek } = require('date-fns')

const storage = multer.diskStorage({
    destination: '../images-storage/',
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ 
    storage: storage,
    limits: {fileSize: 1000000} 
}).single('image');


router.post('/', (req, res) => {

    
    upload(req, res, async (err) =>{
        if (err instanceof multer.MulterError) {
            return res.status(400).send({msg: err.message})
        }

            //Input validation
        const { error, value } = tradeValidation(req.body);

        if(error) return res.status(400).send({msg: error.details[0].message}) 




        const trade = Trade.build({
            stock: req.body.stock,
            contractType: req.body.contractType,
            strike: req.body.strike,
            imageURL: req.file.filename,
            expirationDate: req.body.expirationDate

        });
        try {
            await trade.save();
            res.send({trade: trade.id})
        } catch(err) {
            res.status(400).send({msg: err});
        }
    })
    
    
})

router.get('/all', async(req, res) => {
    const results = await Trade.findAll()
    res.send(results)
})

router.get('/past', async(req, res) => {
    const today = new Date();
    const start = startOfWeek(today, {weekStartsOn: 1});
    const end = endOfWeek(today, {weekStartsOn: 1});

    const results = await Trade.findAll({
        where: {
            createdAt: {
                [Op.notBetween]: [start, end]
            }
        }
    })
    res.send(results)
})

router.get('/current', async(req, res) => {
    const today = new Date();
    const start = startOfWeek(today, {weekStartsOn: 1});
    const end = endOfWeek(today, {weekStartsOn: 1});

    /* const results = await Trade.findAll({
        where: sequelize.where(sequelize.literal('CURRENT_DATE'),sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')))
    }) */

    const results = await Trade.findAll({
        where: {
            createdAt: {
                [Op.between]: [start, end]
            }
        }
    })
    res.send(results)
})


router.put('/:tradeId', async(req, res) => {

    const oldImageURL = await Trade.findOne({
        attributes: ['imageURL'],
        where: {
            id: req.params.tradeId
        }
    })
    fs.unlinkSync(path.resolve(__dirname, "../../images-storage/" + oldImageURL.dataValues.imageURL))

    upload(req, res, async (err) =>{
        if (err instanceof multer.MulterError) {
            return res.status(400).send({msg: err.message})
        }

            //Input validation
        const { error, value } = tradeValidation(req.body);

        if(error) return res.status(400).send({msg: error.details[0].message}) 

        const updatedTrade = await Trade.update({
            stock: req.body.stock,
            contractType: req.body.contractType,
            strike: req.body.strike,
            imageURL: req.file.filename,
            expirationDate: req.body.expirationDate
        },{
            where: {
                id: req.params.tradeId
            }
        })
        res.send({msg: updatedTrade[0] + ' rows modified'})

    })

})

module.exports = router;