import { PaginatedService } from '@app/typeorm';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { AbstractService } from '../abstract.service';
import { REQUEST_AUTH_USER_KEY } from 'src/modules/auth/definitions/constants';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';
import { Production } from 'src/core/entities/stockmanagement/production.entity';
import { CreateProductionDto } from 'src/core/dto/stockmanagement/create-production.dto';
import { UpdateProductionDto } from 'src/core/dto/stockmanagement/update-production.dto';
import { BranchToProductService } from '../subsidiary/branch-to-product.service';
import { ProductService } from '../product/product.service';
import {
  ProductionStatusEnum,
  ReasonTypeEnum,
  StockMovementSourceEnum,
  StockMovementTypeEnum,
} from 'src/core/definitions/enums';
import { RunInTransactionService } from '../transaction/runInTransaction.service';
import { BranchVariantToProductService } from '../subsidiary/branch-variant-to-product.service';
import { StockMovementService } from '../stockMovement/stockMovement.service';

@Injectable()
export class ProductionService extends AbstractService<Production> {
  public NOT_FOUND_MESSAGE = `Ajustement de stock non trouvé`;

  constructor(
    @InjectRepository(Production)
    private _repository: Repository<Production>,
    private readonly branchToProductService: BranchToProductService,
    private readonly productService: ProductService,
    private readonly runInTransactionService: RunInTransactionService,
    private readonly branchVariantToProductService: BranchVariantToProductService,
    private readonly stockMovementService: StockMovementService,

    protected paginatedService: PaginatedService<Production>,
    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  get repository(): Repository<Production> {
    return this._repository;
  }

  async myreadPaginatedListRecord(
    options?: FindManyOptions<any>,
    page?: number,
    perPage?: number,
  ) {
    // Paginate using provided options, page, and perPage
    const productions = await this.readPaginatedListRecord(options);

    productions.data.map(async (record) => {
      return (record.totalQuantities =
        record?.productionToProducts &&
        record?.productionToProducts.reduce(
          (acc, item) => acc + item.quantity,
          0,
        ));
    });
    // Retrieve detailed records for each item in the paginated response
    /* const detailedRecords = await Promise.all(
      response.data.map(async (record) => {
        return this.readOneRecord({
          ...options,
          where: { ...options?.where, id: record.id },
        });
      }),
    );*/
    // Update response data with detailed records
    //response.data = detailedRecords;
    // Update response data with processed items and return
    return productions as any;
  }

  /*async createRecord(dto: CreateProductionDto): Promise<Production> {
    const result = await super.createRecord({ ...dto });
    if (result) {
      for (const productionToProduct of dto.productionToProducts) {
        const productionProductData = {
          ...productionToProduct,
          destinationBranchId: result.destinationBranchId,
          productionId: result.id,
          type: result.type,
        };
        await this.updateStocks(productionProductData);

        // work for update stock of item of this composed item
        const ciDetails = await this.productService.getDetails(
          productionProductData.productId,
        );
        //level1
        if (ciDetails) {
          for (const itemProduct of ciDetails.bundleToProducts) {
            //check isBundle
            const ItemProductData = {
              ...itemProduct,
              bundleId: itemProduct.bundleId,
              quantity: productionToProduct.quantity * itemProduct.quantity,
              destinationBranchId: result.destinationBranchId,
            };
            if (await this.productService.isBundle(itemProduct.bundleId)) {
              //level2
              const ciDetails2 = await this.productService.getDetails(
                itemProduct.bundleId,
              );

              const headciDetails2 = {
                ...productionToProduct,
                productId: ciDetails2.id,
                destinationBranchId: result.destinationBranchId,
                productionId: result.id,
                type: result.type,
              };
              await this.updateStocks(headciDetails2);

              for (const itemProduct2 of ciDetails2.bundleToProducts) {
                //check isBundle
                const ItemProductData2 = {
                  ...itemProduct2,
                  bundleId: itemProduct2.bundleId,
                  quantity:
                    productionToProduct.quantity * itemProduct2.quantity,
                  destinationBranchId: result.destinationBranchId,
                };
                if (await this.productService.isBundle(itemProduct2.bundleId)) {
                } else {
                  await this.addAndReduceStocks(
                    productionProductData.type,
                    ItemProductData2,
                  );
                }
              }
            } else {
              //update bundleProduct is notBundle
              if (
                productionProductData.type == ProductionStatusEnum.production
              ) {
                await this.updateComposedItemReduceStocks(ItemProductData);
              }
              if (
                productionProductData.type == ProductionStatusEnum.disassembly
              ) {
                await this.updateComposedItemAddStocks(ItemProductData);
              }
            }
          }
        }
      }
    }
    return result as any;
  }*/

  async createRecord(dto: CreateProductionDto): Promise<any> {
    const aggregated =
      await this.productService.aggregatedFlattenedProductForProduction(
        dto.productionToProducts as any,
      );
    if (dto.type == ProductionStatusEnum.production) {
      //verification du child stock
      await this.checkChildStock(aggregated, dto.destinationBranchId, dto.type);
    } else {
      for (const productionToProduct of dto.productionToProducts) {
        const productDetails = await this.productService.getDetails(
          productionToProduct.productId,
        );
        const productionProductData = {
          ...productionToProduct,
          destinationBranchId: dto.destinationBranchId,
          quantity: productionToProduct.quantity,
        };
        await this.checkStockBeforeProduction(
          productDetails,
          productionProductData,
          ProductionStatusEnum.disassembly,
        );
      }
    }

    //verification du stock

    return await this.runInTransactionService.runInTransaction(
      async (manager) => {
        const authUser = this.request[REQUEST_AUTH_USER_KEY] as AuthUser;

        const production = await manager.save(Production, {
          ...dto,
          createdById: authUser.id,
          createdAt: new Date(),
        });
        //Gerer selon quil soit production ou desassemblage
        dto.productionToProducts.map(
          (p) =>
            (p.quantity =
              dto.type == ProductionStatusEnum.production
                ? p.quantity
                : -p.quantity),
        );
        for (const productionToProduct of dto.productionToProducts) {
          const productionProductData = {
            ...productionToProduct,
            destinationBranchId: production.destinationBranchId,
            productionId: production.id,
            type: production.type,
          };
          await this.updateStocks(productionProductData, manager);
        }

        await this.reduceAndAddChildStock(
          aggregated,
          dto.destinationBranchId,
          production.type,
          manager,
        );

        /*await this.applyStockUpdate(stockAdjustment, manager);
      const mstockAdjustment = this.setStockMouvementParameters(
        stockAdjustment,
        reason,
      );*/

        for (const [sku, data] of aggregated.entries()) {
          const productByBranchDetail =
            await this.productService.getByBranchSKU(data.productId, {
              sku,
              destinationBranchId: dto.destinationBranchId,
            });
          const type =
            dto.type == StockMovementSourceEnum.production
              ? StockMovementTypeEnum.output
              : StockMovementTypeEnum.input;
          const source =
            dto.type == StockMovementSourceEnum.production
              ? StockMovementSourceEnum.production
              : StockMovementSourceEnum.disassembly;

          const reason =
            dto.type == StockMovementSourceEnum.production
              ? ReasonTypeEnum.production
              : ReasonTypeEnum.disassembly;

          await this.updateStockMovements(
            {
              ...data,
              quantity:
                dto.type == StockMovementSourceEnum.production
                  ? -data.quantity
                  : data.quantity,
              destinationBranchId: dto.destinationBranchId,
              reference: production.reference,
              source: source,
              sourceId: production.id,
              createdById: authUser?.id,
              sku: sku,
              reason: reason,
              cost: productByBranchDetail.price,
              availableStock: productByBranchDetail.inStock,
              type: type,
            },
            manager,
          );
        }
        return production as any;
      },
    );
  }
  async getFilterByAuthUserBranch(): Promise<FindOptionsWhere<Production>> {
    const authUser = await super.checkSessionBranch();
    if (!(await authUser.can('manage', 'all'))) {
      return {
        branchId: authUser.targetBranchId,
      };
    }

    return {};
  }
  async updateStockMovements(productData: any, manager?: any): Promise<void> {
    if (manager) {
      await manager.getRepository(this.stockMovementService.entity).save({
        productId: productData.productId,
        quantity: productData.quantity,
        type: productData.type,
        source: productData.source,
        branchId: productData.destinationBranchId,
        sku: productData.sku,
        reference: productData.reference,
        sourceId: productData.sourceId,
        cost: productData.cost,
        reason: productData.reason,
        isManual: true,
        totalCost: productData.quantity * productData.cost,
        createdById: productData.createdById,
        availableStock: productData.availableStock,
      });
    } else {
      // Journaliser le mouvement
      await this.stockMovementService.createRecord({
        productId: productData.productId,
        quantity: productData.quantity,
        type: productData.type,
        source: productData.sources,
        branchId: productData.destinationBranchId,
        sku: productData.sku,
        reference: productData.reference,
        sourceId: productData.sourceId,
        cost: productData.cost,
        reason: productData.reason,
        isManual: true,
        totalCost: productData.quantity * productData.cost,
        //createdById: productData.createdById,
        availableStock: productData.availableStock,
      });
    }
  }

  async reduceAndAddChildStock(
    aggregated: any,
    branchId: any,
    type: any,
    manager?: any,
  ) {
    //mise a jour du stock
    for (const [sku, data] of aggregated.entries()) {
      const productDetails = await this.productService.getDetails(
        data.productId,
      );
      await this.myUpdateStocks(
        { ...productDetails, sku: sku },
        {
          ...data,
          quantity:
            type == ProductionStatusEnum.production
              ? data.quantity
              : -data.quantity,
          sku: sku,
          destinationBranchId: branchId,
        },
        manager,
      );
    }
  }

  async updateRecord(
    optionsWhere: FindOptionsWhere<Production>,
    dto: UpdateProductionDto,
  ) {
    const result = await super.updateRecord(optionsWhere, {
      ...dto,
    });

    return result;
  }

  async myUpdateStocks(product, dto: any, manager?: any): Promise<void> {
    /* const sellingData = await this.getDetailBySellingId(dto.sellingId);
    if (sellingData && sellingData.sellingToProducts) {
      await this.updateProductCost(sellingData.sellingToProducts, dto, manager);
    }*/

    //update product stock
    if (product.hasVariant) {
      await this.updateVariantReduceStock(
        product.variantToProducts,
        dto,
        manager,
      );
    } else {
      await this.updateProductReduceStock(
        product.branchToProducts,
        dto,
        manager,
      );
    }
  }

  private async updateVariantReduceStock(
    variants: any[],
    dto: any,
    manager?: any,
  ): Promise<void> {
    const vp = variants.find((el: { sku: any }) => el.sku === dto.sku);

    if (!vp) return;

    const srcProductBranch = vp.branchVariantToProducts.find(
      (el: { branchId: any; sku: any }) =>
        el.branchId === dto.destinationBranchId && el.sku === vp.sku,
    );

    if (srcProductBranch) {
      if (manager) {
        await manager
          .getRepository(this.branchVariantToProductService.entity)
          .update(
            { sku: srcProductBranch.sku, branchId: dto.destinationBranchId },
            { inStock: srcProductBranch.inStock - dto.quantity },
          );
      } else {
        await this.branchVariantToProductService.updateRecord(
          { sku: srcProductBranch.sku, branchId: dto.destinationBranchId },
          { inStock: srcProductBranch.inStock - dto.quantity },
        );
      }
    }
  }

  private async updateProductReduceStock(
    branchToProducts: any[], // Assurez-vous que c'est bien un tableau
    dto: any,
    manager?: any,
  ): Promise<void> {
    //let _currentBranchStock: any;
    try {
      if (!Array.isArray(branchToProducts) || branchToProducts.length === 0) {
        throw new BadRequestException([
          `Données invalides : surcusale non défini ou pas activé`,
        ]);
      }

      if (!dto?.productId || !dto?.destinationBranchId || !dto?.quantity) {
        throw new BadRequestException([
          `Données invalides : Vérifiez productId, destinationBranchId et quantity`,
        ]);
      }

      const currentBranchStock =
        branchToProducts &&
        branchToProducts.find(
          (el: { productId: any; branchId: any }) =>
            el.productId === dto.productId &&
            el.branchId === dto.destinationBranchId,
        );
      //_currentBranchStock = currentBranchStock.inStock;
      if (!currentBranchStock) {
        throw new BadRequestException([
          `Stock introuvable pour le produit ${dto.productId} à la branche ${dto.destinationBranchId}`,
        ]);
      }

      console.log(
        `📦 Mise à jour du stock pour produit ${dto.productId} à la branche ${dto.destinationBranchId}`,
      );
      // 🔁 Utilise manager si dispo

      if (manager) {
        await manager.getRepository(this.branchToProductService.entity).update(
          {
            productId: dto.productId,
            branchId: dto.destinationBranchId,
          },
          { inStock: currentBranchStock.inStock - dto.quantity },
        );
      } else {
        // Mise à jour du stock
        await this.branchToProductService.updateRecord(
          {
            productId: dto.productId,
            branchId: dto.destinationBranchId,
          },
          { inStock: currentBranchStock.inStock - dto.quantity },
        );
      }
      console.log(
        `✅ Stock mis à jour avec succès : Nouveau stock = ${currentBranchStock.inStock - dto.quantity}`,
      );
    } catch (error) {
      //console.log('reeerr', currentBranchStock);
      console.error(`❌ Erreur dans updateProductStock :`, error);
      throw new BadRequestException(error);
      /*throw new BadRequestException([
        //`Erreur lors de la mise à jour du stock :  ${error.message} `,
        `📦 Stock insuffisant pour le produit "${dto.product.displayName}" (SKU: ${dto.product.sku}) Stock actuel: ${_currentBranchStock} | 📥 QQuantité demandée: ${dto.quantity}.`,
      ]);*/
    }
  }

  /*async readPaginatedListRecordForComposite(
    options?: FindManyOptions<any>,
    page?: number,
    perPage?: number,
  ) {
    const productions = await this.readPaginatedListRecord(
      options,
      page,
      perPage,
    );
    const array: Array<object> = [];
    for (const item of productions.data as any) {
      if (!item.hasVariant) {
        if (!item.isBundle) {
          array.push(item);
        } else {
          if (item?.bundleToProductions.length < 3) {
            array.push(item);
          }
        }
      }
    }
    return array;
  }*/

  async readOneRecord(options?: FindOneOptions<Production>) {
    const res = await this.repository.findOne(options);
    if (!res) {
      throw new BadRequestException(this.NOT_FOUND_MESSAGE);
    }
    const entity = { ...res, totalQuantities: 0, productionId: res.id } as any;
    const { destinationBranchId } = entity;

    const newProductionToProducts = entity?.productionToProducts?.reduce(
      (
        acc: {
          productId: any;
          quantity: any;
          cost: any;
          displayName: string;
          sku: any;
        }[],
        { productId, quantity, cost, product: item, sku }: any,
      ) => {
        const srcbranchProducts = item.branchToProducts.find(
          (bp: { branchId: any }) => bp.branchId === destinationBranchId,
        );

        if (srcbranchProducts) {
          acc.push({
            productId: productId,
            quantity: quantity,
            cost: cost,
            displayName: `${item.displayName}`,
            sku: sku,
          });
        }

        return acc;
      },
      [],
    );
    entity.productionToProducts = newProductionToProducts;
    entity.totalQuantities = this.totalQuantities(entity);
    return entity;
  }

  async deleteRecord(optionsWhere: FindOptionsWhere<Production>) {
    const entity = await this.repository.findOneBy(optionsWhere);
    if (!entity) {
      throw new BadRequestException(this.NOT_FOUND_MESSAGE);
    }
    const authUser = this.request[REQUEST_AUTH_USER_KEY] as AuthUser;

    entity.updatedById = authUser?.id;
    entity.deletedById = authUser?.id;
    const result = await this.repository.remove(entity);

    return result;
  }

  async updateStocks(productionProductData: any, manager?: any): Promise<void> {
    const prd = await this.productService.getDetails(
      productionProductData.productId,
    );

    if (productionProductData.type == ProductionStatusEnum.production) {
      await this.updateProductStock(
        prd.branchToProducts,
        productionProductData,
      );
      0;
    }
    if (productionProductData.type == ProductionStatusEnum.disassembly) {
      await this.updateProductStock(
        prd.branchToProducts,
        productionProductData,
      );
    }
  }

  async updateComposedItemAddStocks(productionProductData: any): Promise<void> {
    const prd = await this.productService.getDetails(
      productionProductData.bundleId,
    );
    if (prd.trackStock) {
      await this.updateProductReduceStock(prd.branchToProducts, {
        ...productionProductData,
        productId: prd.id,
      });
    }
  }

  async updateComposedItemReduceStocks(
    productionProductData: any,
  ): Promise<void> {
    const prd = await this.productService.getDetails(
      productionProductData.bundleId,
    );
    if (prd.trackStock) {
      await this.updateProductReduceStock(prd.branchToProducts, {
        ...productionProductData,
        productId: prd.id,
      });
    }
  }

  private async updateProductStock(
    branchToProducts: any,
    dto: any,
  ): Promise<void> {
    const currentBranchStock = branchToProducts.find(
      (el) =>
        el.productId === dto.productId &&
        el.branchId === dto.destinationBranchId,
    );
    await this.branchToProductService.updateRecord(
      {
        productId: dto.productId,
        branchId: dto.destinationBranchId,
      },
      { inStock: currentBranchStock.inStock + dto.quantity },
    );
  }

  private async addAndReduceStocks(
    productionType: string,
    ItemProductData: any,
  ): Promise<void> {
    if (productionType == ProductionStatusEnum.production) {
      await this.updateComposedItemReduceStocks(ItemProductData);
    }
    if (productionType == ProductionStatusEnum.disassembly) {
      await this.updateComposedItemAddStocks(ItemProductData);
    }
  }
  /*private async updateProductReduceStock(
    branchToProducts: any,
    dto: any,
  ): Promise<void> {
    const currentBranchStock = branchToProducts.find(
      (el) =>
        el.productId === dto.productId &&
        el.branchId === dto.destinationBranchId,
    );

    await this.branchToProductService.updateRecord(
      {
        productId: dto.productId,
        branchId: dto.destinationBranchId,
      },
      { inStock: currentBranchStock.inStock - dto.quantity },
    );
  }*/

  totalQuantities(entity: { productionToProducts: any[] }) {
    if (!entity?.productionToProducts) {
      return 0;
    }
    return entity?.productionToProducts?.reduce(
      (acc: any, current: { quantity: any }) => acc + (current.quantity || 0),
      0,
    );
  }

  private async checkStockBeforeProduction(
    product: any,
    deliveryProductData: any,
    type: ProductionStatusEnum,
  ): Promise<any> {
    //try {
    // 🔹 Vérification des entrées
    if (!product || !product.displayName || !product.sku) {
      throw new BadRequestException(
        'Données du produit invalides ou incomplètes.',
      );
    }

    if (
      !deliveryProductData?.destinationBranchId ||
      deliveryProductData?.quantity == null
    ) {
      throw new BadRequestException(
        'Données de livraison invalides ou incomplètes.',
      );
    }
    // 🔹 Récupération du stock actuel
    const currentBranchStock = this.productService.getBranchStock(
      product,
      deliveryProductData,
    );

    if (currentBranchStock == null) {
      throw new BadRequestException(
        `Impossible de récupérer le stock du produit "${product.displayName}" (SKU: ${product.sku}).`,
      );
    }

    console.log(
      `🛑 Vérification du stock pour ${product.displayName} (SKU: ${product.sku})`,
    );
    console.log(
      `📦 Stock actuel: ${currentBranchStock} | 📥 Quantité demandée: ${deliveryProductData.quantity}`,
    );

    if (type == ProductionStatusEnum.production) {
      // 🔹 Vérification de la disponibilité du stock
      if (currentBranchStock < deliveryProductData.quantity) {
        throw new BadRequestException(
          [
            `📦 Stocks insuffisant pour le produit "${product.displayName}" (SKU: ${product.sku}) Stock actuel: ${currentBranchStock} | 📥 Quantité demandée: ${deliveryProductData.quantity}.`,
          ],
          /*{
              stockActuel: currentBranchStock,
              quantiteDemandee: deliveryProductData.quantity,
              analyse: this.analyzeStockIssue(product, currentBranchStock),
            },*/
        );
      }
    } else {
      if (!(await this.productService.isBundle(product.id))) {
        throw new BadRequestException(['Ce produit n’est pas un bundle']);
      }
      // 🔹 Vérification de la disponibilité du stock pour le bundle
      if (deliveryProductData.quantity > currentBranchStock) {
        throw new BadRequestException([
          `📦 Stocks insuffisant pour le produit "${product.displayName}" (SKU: ${product.sku}) Stock actuel: ${currentBranchStock} | 📥 Quantité à desassembler: ${deliveryProductData.quantity}.`,
        ]);
      }
    }

    console.log(
      `✅ Stock suffisant pour ${product.displayName} (SKU: ${product.sku})`,
    );
  }

  private async checkChildStock(
    aggregated: any,
    destinationBranchId: any,
    type: ProductionStatusEnum,
  ) {
    for (const [sku, data] of aggregated && aggregated.entries()) {
      const productDetails = await this.productService.getDetails(
        data.productId,
      );
      await this.checkStockBeforeProduction(
        { ...productDetails, sku: sku },
        {
          destinationBranchId: destinationBranchId,
          quantity: data.quantity,
          sku: sku,
        },
        type,
      );
    }
  }
}
