const Product = require('../models/product')

const getAllProducts = async (req, res) => {
    try {
        const { featured, company, name, sort, fields , numericFilters} = req.query
        const queryObject = {}
        if (featured) {
            queryObject.featured = featured === 'true' ? true : false
        }
        if (company) {
            queryObject.company = company
        }
        if (name) {
            queryObject.name = { $regex: name, $options: 'i' }
        }
        if(numericFilters){
            const operatorMap ={
                '>':'$gt',
                '<':'$lt',
                '=':'eq',
                '>=':'$gte',
                '<=': 'lte'
            }
            const regEx = /\b(<|>|>=|<=|=)\b/g
            let filters = numericFilters.replace(regEx,(match)=>`-${operatorMap[match]}-`);
            console.log(filters)
            const options = ['price','rating'];
            filters = filters.split(',').forEach((item)=>{
                const [field,operator,value] = item.split('-')
                if(options.includes(field)){
                      queryObject[field] = {[operator] : Number(value)}
                }
            });
        }

        console.log(queryObject);

        let result = Product.find(queryObject)
        if (sort) {
            // console.log(sort)
            const sortList = sort.split(',').join(' ');
            result = result.sort(sortList);
        }

        if (fields) {
            const fieldList = fields.split(',').join(' ');
            result = result.select(fieldList)
        }
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit) || 10
        const skip = (page - 1) * limit;

        result = result.skip(skip).limit(limit);

        const products = await result;
        res.status(200).json({ products, nbHits: products.length });

    } catch (error) {
        console.log(error);
    }

}

const getAllProductsStatic = async (req, res) => {
    try {
        const products = await Product.find({
            price: { $gt: 59 }
        }).sort('name').select('name price').limit(10).skip(5);
        res.status(200).json({ products, nbHits: products.length })
    }
    catch (error) {
        console.log(error)
    }
}

module.exports = {
    getAllProducts, getAllProductsStatic
}