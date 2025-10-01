import { Request, Response } from "express";
import { Op, OrderItem, WhereOptions } from "sequelize";
import { createAuditLog } from "@/middleware/audit";
import { Product } from "@/models/Product";
import { AuthRequest } from "@/interfaces/auth";

const validateProduct = (data: Product) => {
  const errors: string[] = [];
  if (!data.name || data.name.trim() === "") errors.push("Name is required.");
  if (!data.category || data.category.trim() === "")
    errors.push("Category is required.");
  if (data.price === undefined || data.price <= 0)
    errors.push("Price must be a positive number.");
  if (data.stock === undefined || data.stock < 0)
    errors.push("Stock must be a non-negative integer.");
  return errors;
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  const validationErrors = validateProduct(req.body as Product);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const product = await Product.create(req.body);
    await createAuditLog(
      req.user!.id,
      "product_created",
      "Product",
      product.id,
      req.body
    );
    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  const {
    search,
    category,
    sortBy,
    order = "ASC",
    page = 1,
    limit = 10,
  } = req.query;

  const where: WhereOptions<Product> = {};
  if (search) {
    const searchTerm = search.toString();
    where.name = { [Op.iLike]: `%${searchTerm}%` };
    where.category = { [Op.iLike]: `%${searchTerm}%` };
  }
  if (category) {
    where.category = category.toString();
  }

  const offset = (Number(page) - 1) * Number(limit);
  const orderArray: OrderItem[] = [];
  const validSortColumns = [
    "name",
    "category",
    "price",
    "stock",
    "createdAt",
    "updatedAt",
  ];
  const sortColumn = sortBy ? sortBy.toString() : null;
  if (sortColumn && validSortColumns.includes(sortColumn)) {
    const orderDirection =
      order.toString().toUpperCase() === "DESC" ? "DESC" : "ASC";
    orderArray.push([sortColumn, orderDirection]);
  } else {
    orderArray.push(["createdAt", "DESC"]);
  }

  try {
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit: Number(limit),
      offset: offset,
      order: orderArray,
    });

    res.status(200).json({
      totalItems: count,
      currentPage: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Error fetching product", error });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const validationErrors = validateProduct(req.body);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const oldProductData = product.toJSON();
    await product.update(req.body);
    await createAuditLog(
      req.user!.id,
      "product_updated",
      "Product",
      product.id,
      { old: oldProductData, new: req.body }
    );
    res.status(200).json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product", error });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy();
    await createAuditLog(
      req.user!.id,
      "product_deleted",
      "Product",
      product.id
    );
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product", error });
  }
};
