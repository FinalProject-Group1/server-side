const { Product } = require('../models');
class ProductController {
	static async getProducts(req, res, next) {
		try {
			const { category } = req.query;
			const query = { where: {} };

			if (category) {
				query.where.category = category;
			}

			const products = await Product.findAll(query);

			res.status(200).json(products);
		} catch (error) {
			next(error);
		}
	}

	static async getProductById(req, res, next) {
		try {
			const { id } = req.params;
			const products = await Product.findOne({
				where: {
					id,
				},
			});

			res.status(200).json(products);
		} catch (error) {
			next(error);
		}
	}
}

module.exports = ProductController;
