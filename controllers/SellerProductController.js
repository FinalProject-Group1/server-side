const { SellerProduct, Product } = require('../models');
class SellerProductController {
	static async sellerAdd(req, res, next) {
		try {
			const { ProductId, stock, price } = req.body;
			// console.log(req.user, '<<<');
			const SellerId = req.user.id;
			// console.log({ ProductId, stock, price, SellerId });
			let status;
			if (stock === 0) {
				status = 'inactive';
			} else {
				status = 'active';
			}

			const seller = await SellerProduct.findOne({
				where: { SellerId: SellerId, ProductId: +ProductId },
			});
			// console.log(seller, '<< ini hasilnya apa?');
			if (seller) throw { name: 'AddError' };

			const create = await SellerProduct.create({
				ProductId: +ProductId,
				stock: +stock,
				price: +price,
				SellerId,
				status,
			});

			res.status(201).json(create);
		} catch (error) {
			next(error);
		}
	}

	static async sellerFindById(req, res, next) {
		try {
			const {id} = req.params
			const sellerProduct = await SellerProduct.findByPk(id);

			res.status(200).json(sellerProduct);
		} catch (error) {
			next(error);
		}
	}

	static async sellerEdit(req, res, next) {
		try {
			const { id } = req.params;
			const { ProductId, stock, price } = req.body;
			// console.log(req.user, "<<<")
			const SellerId = req.user.id;
			// console.log({ProductId, stock, price, SellerId})
			// {ProductId: +ProductId, stock: +stock, price: +price, SellerId}
			let status;
			if (+stock === 0) {
				status = 'inactive';
			} else {
				status = 'active';
			}
			const sellerProduct = await SellerProduct.findByPk(id);

			await sellerProduct.update({
				ProductId: +ProductId,
				stock: +stock,
				price: +price,
				SellerId,
				status,
			});

			res.status(200).json({ message: 'Update succesfully' });
		} catch (error) {
			next(error);
		}
	}

	static async getAllSeller(req, res, next) {
		try {
			const { productId } = req.query;
			const query = {
				include: [
					{
						association: 'seller',
					},
					{
						model: Product,
						as: 'product',
					},
				],
			};

			if (productId) {
				query.where = {
					ProductId: productId,
				};
			}

			const sellerProducts = await SellerProduct.findAll(query);

			res.status(200).json(sellerProducts);
		} catch (error) {
			// console.log(error);
			next(error);
		}
	}
}

module.exports = SellerProductController;
