const router = require('express').Router();
const Trade  = require('../models/Trade');
const { tradeValidation } = require('../validation');
const sequelize = require('../config/database');
const multer = require('multer');
const path = require('path')

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
    //Input validation
    const { error, value } = tradeValidation(req.body);

    if(error) return res.status(405).send({msg: error.details[0].message}) 
    
    upload(req, res, async (err) =>{
        if (err instanceof multer.MulterError) {
            return res.status(400).send({msg: err.message})
        }




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
            res.status(400).send(err);
        }
    })
    
    
})

router.get('/all', async(req, res) => {
    const results = await Trade.findAll()
    res.send(results)
})

router.get('/current', async(req, res) => {
    console.log(new Date())
    const results = await Trade.findAll({
        where: sequelize.where(sequelize.literal('CURRENT_DATE'),sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')))
    })
    res.send(results)
})

module.exports = router;