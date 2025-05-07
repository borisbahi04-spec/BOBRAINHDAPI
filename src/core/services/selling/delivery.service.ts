import { isUniqueConstraint, PaginatedService } from '@app/typeorm';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  EntityManager,
  Equal,
  FindOneOptions,
  FindOptionsWhere,
  Not,
  Repository,
} from 'typeorm';
import { AbstractService } from '../abstract.service';
import { BranchVariantToProductService } from '../subsidiary/branch-variant-to-product.service';
import { BranchToProductService } from '../subsidiary/branch-to-product.service';
import { ProductService } from '../product/product.service';
import { VariantToProductService } from '../subsidiary/variant-to-product.service';
import { Delivery } from 'src/core/entities/selling/delivery.entity';
import { CreateDeliveryDto } from 'src/core/dto/selling/create-delivery.dto';
import {
  ReasonTypeEnum,
  SellingStatusEnum,
  StockMovementSourceEnum,
  StockMovementTypeEnum,
} from 'src/core/definitions/enums';
import { SellingService } from './selling.service';
import { Product } from 'src/core/entities/product/product.entity';
import { REQUEST_AUTH_USER_KEY } from 'src/modules/auth/definitions/constants';
import { AuthUser } from 'src/core/entities/session/auth-user.entity';
import { RunInTransactionService } from '../transaction/runInTransaction.service';
import { StockMovementService } from '../stockMovement/stockMovement.service';

@Injectable()
export class DeliveryService extends AbstractService<Delivery> {
  public NOT_FOUND_MESSAGE = `Commande non trouvée `;

  constructor(
    @InjectRepository(Delivery)
    private _repository: Repository<Delivery>,

    protected paginatedService: PaginatedService<Delivery>,
    @Inject(forwardRef(() => SellingService))
    private sellingService: SellingService,
    private branchToProductService: BranchToProductService,
    private readonly branchVariantToProductService: BranchVariantToProductService,
    private readonly productService: ProductService,
    private readonly variantToProductService: VariantToProductService,
    private readonly runInTransactionService: RunInTransactionService,
    private readonly stockMovementService: StockMovementService,

    @Inject(REQUEST) protected request: any,
  ) {
    super();
  }

  get repository(): Repository<Delivery> {
    return this._repository;
  }

  async getFilterByAuthUserBranch(): Promise<FindOptionsWhere<Delivery>> {
    const authUser = await super.checkSessionBranch();
    if (!(await authUser.can('manage', 'all'))) {
      return {
        branchId: authUser.targetBranchId,
      };
    }

    return {};
  }

  async createRecord(dto: DeepPartial<CreateDeliveryDto>): Promise<Delivery> {
    const authUser = await super.checkSessionBranch();
    let generatedSelling;
    try {
      if (dto.reference) {
        await isUniqueConstraint(
          'reference',
          Delivery,
          { reference: dto.reference },
          {
            message: `La référence "${dto.reference}" de la réception est déjà utilisée`,
          },
        );
      }

      if (!dto.sellingId) {
        if (!dto.transporter) {
          throw new BadRequestException([
            'Receptionniste requis pour créer une vente',
          ]);
        }
        dto.destinationBranchId = authUser.targetBranchId;
        generatedSelling = await this.generateSellings(dto);

        dto.sellingId = generatedSelling.id;
        dto.transporter = { id: generatedSelling?.customerId };
        dto.sellingSourceId = generatedSelling.id;
        if (generatedSelling?.sellingToAdditionalCosts?.length > 0) {
          dto.deliveryToAdditionalCosts =
            generatedSelling.sellingToAdditionalCosts.map(
              (item: { id: any; amount: any }) => ({
                sellingToAdditionalCostId: item.id,
                amount: item.amount,
              }),
            );
        }
      }

      const sellingDetails = await this.sellingService.getDetails(
        dto.sellingId,
      );
      if (!sellingDetails) {
        throw new BadRequestException(['Commande introuvable']);
      }

      for (const item of dto.deliveryToProducts) {
        const hasCycle = await this.hasCyclicDependency(item.productId);
        if (hasCycle) {
          const rootProduct = await this.productService.getById(item.productId);
          throw new BadRequestException([
            `Boucle de dépendance détectée pour le produit ${rootProduct.displayName}`,
          ]);
        }
      }

      const delivery = await super.createRecord({
        ...dto,
        branchId: authUser.targetBranchId,
      });
      return delivery;
    } catch (error) {
      if (generatedSelling?.id) {
        await this.sellingService.deleteRecord({ id: generatedSelling?.id });
      }
      throw new BadRequestException([
        `Impossible de créer la livraison : ${error.message}`,
      ]);
    }
  }

  getDetailBySellingId = async (sellingId: string) => {
    return await this.sellingService.readOneRecord({
      where: { id: sellingId },
      relations: {
        sellingToProducts: {
          product: {
            variantToProducts: { branchVariantToProducts: true },
            branchToProducts: true,
          },
        },
        deliverys: { deliveryToProducts: true },
      },
    });
  };

  async verifyCartStockAndUpdateStock(
    cartItems: any,
    dto: any,
    manager?: any,
  ): Promise<void> {
    const aggregated =
      await this.productService.aggregatedFlattenedProduct(cartItems);
    // 🔹 Vérifier le stock du produit aggrege

    //verification du stock
    for (const [sku, data] of aggregated.entries()) {
      const productDetails = await this.productService.getDetails(
        data.productId,
      );
      await this.checkStockBeforeDelivery(
        { ...productDetails, sku: sku },
        {
          destinationBranchId: dto.destinationBranchId,
          quantity: data.quantity,
          sku: sku,
        },
      );
    }

    //mise a jour du stock
    for (const [sku, data] of aggregated.entries()) {
      const productDetails = await this.productService.getDetails(
        data.productId,
      );
      await this.myUpdateStocks(
        { ...productDetails, sku: sku },
        {
          ...data,
          sku: sku,
          destinationBranchId: dto.destinationBranchId,
        },
        manager,
      );
    }

    //mettre a jour le movement du stock
    const authUser = this.request[REQUEST_AUTH_USER_KEY] as AuthUser;
    dto.closedById = authUser?.id;
    //mise a jour du stock
    for (const [sku, data] of aggregated.entries()) {
      const productByBranchDetail = await this.productService.getByBranchSKU(
        data.productId,
        {
          sku,
          destinationBranchId: dto.destinationBranchId,
        },
      );
      // ✅ Vérifie si c’est un bundle ET qu’il n’est pas destiné à la production
      const isBundle = await this.productService.isBundle(data.productId);
      const isUseProduction = await this.productService.isUseProduction(
        data.productId,
      );

      if (isBundle && !isUseProduction) {
        // ⛔️ Ne pas créer de mouvement pour ce type de bundle
        continue;
      }

      await this.updateStockMovements(
        {
          ...data,
          destinationBranchId: dto.destinationBranchId,
          reference: dto.reference,
          sourceId: dto.id,
          createdById: authUser?.id,
          sku: sku,
          cost: productByBranchDetail.price,
          availableStock: productByBranchDetail.inStock,
        },
        manager,
      );
    }
  }

  async hasCyclicDependency(
    productId: string,
    visited: Set<string> = new Set(),
  ): Promise<boolean> {
    if (visited.has(productId)) return true;

    const product = await this.productService.getDetails(productId);

    // Si ce n'est pas un bundle, on n'analyse pas plus loin
    if (!product.isBundle) return false;

    visited.add(productId);

    const children = product.bundleToProducts?.map((p) => p.bundleId) || [];
    for (const childId of children) {
      if (await this.hasCyclicDependency(childId, new Set(visited))) {
        return true;
      }
    }

    return false;
  }

  async updateStocks(deliveryProductData: any, manager?: any): Promise<void> {
    const prd = await this.productService.getDetails(
      deliveryProductData.productId,
    );
    if (!prd) {
      throw new BadRequestException(
        `Produit ${deliveryProductData.productId} introuvable`,
      );
    }
    const sellingData = await this.getDetailBySellingId(
      deliveryProductData.sellingId,
    );
    if (sellingData && sellingData.sellingToProducts) {
      await this.updateProductCost(
        sellingData.sellingToProducts,
        deliveryProductData,
        manager,
      );
    }

    //update product stock
    if (prd.hasVariant) {
      await this.updateVariantStock(
        prd.variantToProducts,
        deliveryProductData,
        manager,
      );
    } else {
      if (!prd.isBundle) {
        await this.updateProductStock(
          prd.branchToProducts,
          deliveryProductData,
          manager,
        );
      } else {
        // Mise à jour du stock pour les bundles
        await this.updateProductStock(
          prd.branchToProducts,
          deliveryProductData,
          manager,
        );

        for (const nestedBundleItem of prd.bundleToProducts ?? []) {
          const updatedStock =
            nestedBundleItem.quantity * deliveryProductData.quantity;
          await this.updateChildStock(
            nestedBundleItem,
            {
              ...deliveryProductData,
              sku: nestedBundleItem.isVariant
                ? nestedBundleItem.sku
                : deliveryProductData.sku,
              quantity: updatedStock,
              sourceId: deliveryProductData.destinationBranchId,
              reference: deliveryProductData.reference,
            },
            manager,
          );
          //movement child
          let _nestedBundleItem: any = await this.productService.getDetails(
            nestedBundleItem.bundleId,
          );
          if (!_nestedBundleItem.isBundle) {
            _nestedBundleItem =
              await this.productService.generateNewProductSingleNotBundleVersion(
                _nestedBundleItem,
                deliveryProductData.destinationBranchId,
              );
          } else {
            _nestedBundleItem =
              await this.productService.generateNewProductBundleVersion(
                _nestedBundleItem,
                deliveryProductData.destinationBranchId,
              );
          }
          if (
            !deliveryProductData.bundleId &&
            (deliveryProductData.depth || 0) < 3
          ) {
            await this.updateStockMovements(
              {
                ...nestedBundleItem,
                sku: _nestedBundleItem.sku,
                quantity: updatedStock,
                cost: _nestedBundleItem.price,
                productId: _nestedBundleItem.id,
                sourceId: deliveryProductData.id,
                branchId: deliveryProductData.destinationBranchId,
                reference: deliveryProductData.reference,
              },
              manager,
            );
          }
        }
      }
    }
  }

  async myUpdateStocks(product, dto: any, manager?: any): Promise<void> {
    const sellingData = await this.getDetailBySellingId(dto.sellingId);
    if (sellingData && sellingData.sellingToProducts) {
      await this.updateProductCost(sellingData.sellingToProducts, dto, manager);
    }

    //update product stock
    if (product.hasVariant) {
      await this.updateVariantStock(product.variantToProducts, dto, manager);
    } else {
      await this.updateProductStock(product.branchToProducts, dto, manager);
    }
  }

  /*async flattenProductStructure(
    productId: string,
    sku: string,
    quantity = 1,
    result: Map<string, { productId: string; quantity: number }> = new Map(),
    depth = 0,
  ): Promise<Map<string, { productId: string; quantity: number }>> {
    const product = await this.productService.getDetails(productId);

    if (!product) {
      throw new NotFoundException(`Produit ${productId} introuvable`);
    }

    // Stopper si trop de récursion (protection)
    if (depth > 10) {
      throw new Error('Profondeur maximale atteinte dans le flattening');
    }

    const isBundle = product.isBundle && product.bundleToProducts?.length > 0;

    if (!isBundle || product.isUseProduction) {
      // Cas 1 : produit simple ou bundle destiné à la production → on le traite comme un bloc
      const current = result.get(sku)?.quantity || 0;
      result.set(sku, { productId, quantity: current + quantity });
      return result;
    }

    // Cas 2 : bundle non destiné à la production → on l'aplatit (récursif sur ses composants)
    for (const component of product.bundleToProducts ?? []) {
      if (!component.bundleId || !component.sku || !component.quantity)
        continue;

      const componentQty = component.quantity * quantity;

      await this.flattenProductStructure(
        component.bundleId,
        component.sku,
        componentQty,
        result,
        depth + 1,
      );
    }

    return result;
  }*/

  async checkStocks(deliveryProductData: any): Promise<void> {
    //try {
    const productDetails = await this.productService.getDetails(
      deliveryProductData.productId,
    );

    if (!productDetails) {
      throw new BadRequestException([
        `Produit ${deliveryProductData.productId} introuvable.`,
      ]);
    }
    // 🔹 Vérifier le stock du produit principal
    await this.checkStockBeforeDelivery(productDetails, deliveryProductData);
    // Calculate the stock update based on bundle quantity

    // 🔹 Vérifier les stocks des produits du bundle s'il s'agit d'un bundle
    if (productDetails.isBundle) {
      for (const nestedBundleItem of productDetails.bundleToProducts ?? []) {
        const updatedStock =
          nestedBundleItem.quantity * deliveryProductData.quantity;
        await this.updateChildCheckStock(nestedBundleItem, {
          ...deliveryProductData,
          sku: nestedBundleItem.isVariant
            ? nestedBundleItem.sku
            : deliveryProductData.sku,
          quantity: updatedStock,
        });
        /*} catch (error) {
          console.error('❌ loto2:', productDetails);
          console.error('❌ loto22:', nestedBundleItem);
          console.error('❌ Stock insuffisant dans le bundle:', error);

          throw new BadRequestException([
            `'📦 Stock insuffisant pour le bundle ${nestedBundleItem.bundle.displayName}Stock actuel: ${nestedBundleItem?.quantity} | 📥 Quantité demandée: ${deliveryProductData.quantity}.' `,
          ]);
          //stockErrors.push(error.response || error.message);
        }*/
      }
    }
    /* } catch (error) {
      console.error('❌ Stock insuffisant:', error);
      //throw new BadRequestException([error]);
      //stockErrors.push(error.response || error.message);
    }*/

    // 🔴 Si au moins un produit (ou un élément d’un bundle) a un stock insuffisant, on annule la livraison
    /*if (stockErrors.length > 0) {
      throw new BadRequestException({
        message: `Stock insuffisant pour un ou plusieurs articles (y compris des éléments de bundles).${stockErrors}`,
        details: stockErrors,
      });
    }*/
  }

  private async updateVariantStock(
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

  /* private async updateChildStock2(
    bundleItem: any,
    deliveryProductData: any,
    manager?: any,
  ): Promise<void> {
    if (!bundleItem?.bundleId || !deliveryProductData?.quantity) {
      throw new BadRequestException([
        'Données invalides pour la mise à jour du stock.',
      ]);
    }

    const childProduct = await this.productService.getDetails(
      bundleItem.bundleId,
    );
    // Vérifie que le produit enfant existe
    if (!childProduct) {
      throw new BadRequestException([
        `Produit enfant introuvable: ${bundleItem.bundleId}`,
      ]);
    }

    if (!bundleItem.isVariant) {
      // Mise à jour du stock pour les produits associés
      await this.updateProductStock(
        childProduct.branchToProducts,
        {
          ...deliveryProductData,
          productId: bundleItem.bundleId,
        },
        manager,
      );
    } else {
      await this.updateVariantStock(
        childProduct.variantToProducts,
        {
          ...deliveryProductData,
          productId: bundleItem.bundleId,
        },
        manager,
      );
    }
    // Mise à jour du stock en fonction de la quantité du bundle
    const updatedStock = bundleItem.quantity * deliveryProductData.quantity;

    // Si l'enfant est un bundle, mise à jour récursive
    if (childProduct.isBundle && Array.isArray(childProduct.bundleToProducts)) {
      for (const nestedBundleItem of childProduct.bundleToProducts) {
        await this.updateChildStock(
          nestedBundleItem,
          {
            ...deliveryProductData,
            sku: nestedBundleItem.isVariant
              ? nestedBundleItem.sku
              : deliveryProductData.sku,
            quantity: updatedStock,
          },
          manager,
        );
      }
    }
  }*/

  /*private async updateChildStock(
    bundleItem: any,
    deliveryProductData: any,
    manager?: any,
  ): Promise<void> {
    const depth = deliveryProductData.depth ?? 0;

    // ✅ Bloque toute récursivité au-delà de 2 niveaux
    if (depth >= 2) return;

    // ✅ Validation des données
    if (!bundleItem?.bundleId || !deliveryProductData?.quantity) {
      throw new BadRequestException([
        'Données invalides pour la mise à jour du stock.',
      ]);
    }

    const childProduct = await this.productService.getDetails(
      bundleItem.bundleId,
    );
    if (!childProduct) {
      throw new BadRequestException([
        `Produit enfant introuvable: ${bundleItem.bundleId}`,
      ]);
    }

    const updatedQuantity = bundleItem.quantity * deliveryProductData.quantity;

    // ✅ Construction des données pour le produit enfant
    const updatedData = {
      ...deliveryProductData,
      productId: bundleItem.bundleId,
      sku: bundleItem.isVariant ? bundleItem.sku : deliveryProductData.sku,
      quantity: updatedQuantity,
      depth: depth + 1,
    };

    // ✅ Mise à jour du stock selon qu’il s’agit d’une variante ou non
    if (bundleItem.isVariant) {
      await this.updateVariantStock(
        childProduct.variantToProducts,
        updatedData,
        manager,
      );
    } else {
      await this.updateProductStock(
        childProduct.branchToProducts,
        updatedData,
        manager,
      );
    }

    // ✅ Si le produit enfant est aussi un bundle, on continue la mise à jour (dans la limite de profondeur)
    if (childProduct.isBundle && Array.isArray(childProduct.bundleToProducts)) {
      for (const nestedItem of childProduct.bundleToProducts) {
        await this.updateChildStock(nestedItem, updatedData, manager);
      }
    }
  }*/

  private async updateChildStock(
    bundleItem: any,
    deliveryProductData: any,
    manager?: any,
  ): Promise<void> {
    const depth = deliveryProductData.depth ?? 0;

    // ✅ Bloque toute récursivité au-delà de 2 niveaux
    if (depth >= 2) return;

    // ✅ Validation des données
    if (!bundleItem?.bundleId || !deliveryProductData?.quantity) {
      throw new BadRequestException([
        'Données invalides pour la mise à jour du stock.',
      ]);
    }

    const childProduct = await this.productService.getDetails(
      bundleItem.bundleId,
    );
    if (!childProduct) {
      throw new BadRequestException([
        `Produit enfant introuvable: ${bundleItem.bundleId}`,
      ]);
    }
    // ✅ Construction des données pour le produit enfant
    const updatedData = {
      ...deliveryProductData,
      productId: bundleItem.bundleId,
      sku: bundleItem.isVariant ? bundleItem.sku : deliveryProductData.sku,
      quantity: deliveryProductData.quantity,
      depth: depth + 1,
    };

    // ✅ Mise à jour du stock selon qu’il s’agit d’une variante ou non
    if (bundleItem.isVariant) {
      await this.updateVariantStock(
        childProduct.variantToProducts,
        updatedData,
        manager,
      );
    } else {
      await this.updateProductStock(
        childProduct.branchToProducts,
        updatedData,
        manager,
      );
    }

    // ✅ Si le produit enfant est aussi un bundle, on continue la mise à jour (dans la limite de profondeur)
    if (childProduct.isBundle && Array.isArray(childProduct.bundleToProducts)) {
      for (const nestedItem of childProduct.bundleToProducts) {
        await this.updateChildStock(nestedItem, updatedData, manager);
      }
    }
  }

  private async updateChildCheckStock(
    bundleChildItem: any,
    deliveryProductData: any,
  ): Promise<any> {
    //try {
    // 🔹 Vérification des entrées
    if (!bundleChildItem?.bundleId || !deliveryProductData?.quantity) {
      throw new BadRequestException({
        message: 'Données invalides pour updateChildCheckStock',
        details: { bundleChildItem, deliveryProductData },
      });
    }
    console.log('c', bundleChildItem);

    // 🔹 Récupération des détails du produit enfant
    const childProduct = await this.productService.getDetails(
      bundleChildItem.bundleId,
    );
    console.log('nestedBundleItem2025', childProduct);

    if (!childProduct) {
      throw new BadRequestException([
        `Produit enfant introuvable (ID: ${bundleChildItem.id}, NAME: ${bundleChildItem.displayName},  SKU: ${bundleChildItem.sku}).`,
      ]);
    }

    // 🔹 Vérification du stock avant mise à jour
    await this.checkStockBeforeDelivery(childProduct, {
      ...deliveryProductData,
      productId: bundleChildItem.id,
    });

    console.log(
      `✅ Stock vérifié pour: ${childProduct.displayName} (ID: ${childProduct.id})`,
    );

    // 🔹 Calcul de la quantité totale requise
    const updatedStock =
      bundleChildItem.quantity * deliveryProductData.quantity;

    // 🔹 Vérifier si l’enfant est un bundle et a des sous-produits
    if (
      childProduct.isBundle &&
      Array.isArray(childProduct.bundleToProducts) &&
      childProduct.bundleToProducts.length > 0
    ) {
      for (const nestedBundleItem of childProduct.bundleToProducts) {
        await this.updateChildCheckStock(nestedBundleItem, {
          ...deliveryProductData,
          sku: nestedBundleItem.isVariant
            ? nestedBundleItem.sku
            : deliveryProductData.sku,
          quantity: updatedStock,
        });
      }
    }

    return;
    /* } catch (error) {
      console.error(
        `❌ Erreur dans updateChildCheckStock (Produit ID: ${bundleChildItem?.id || 'N/A'})`,
        error.message,
      );

      throw new BadRequestException([
        'Erreur lors de la vérification du stock des produits enfants.',
        error.response || error.message,
      ]);
    }*/
  }

  /*private async updateProductStock(
    branchToProducts: any, //branchToProducts,
    dto: any,
  ): Promise<void> {
    const currentBranchStock = branchToProducts.find(
      (el: { productId: any; branchId: any }) =>
        el.productId === dto.productId &&
        el.branchId === dto.destinationBranchId,
    );
    console.log('2kkkkkkkkkk');

    await this.branchToProductService.updateRecord(
      {
        productId: dto.productId,
        branchId: dto.destinationBranchId,
      },
      { inStock: currentBranchStock.inStock - dto.quantity },
    );
  }*/

  private async updateProductStock(
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

  /* private async updateProductCost(
    arrayToProducts: any,
    deliveryProductData: any,
  ): Promise<void> {
    for (const oproduct of arrayToProducts ?? []) {
      //consider deliveryd quantity more that 0
      if (
        oproduct.sku == deliveryProductData.sku &&
        deliveryProductData.quantity > 0
      ) {
        if (oproduct.variantId) {
          await this.variantToProductService.updateRecord(
            {
              id: oproduct.variantId,
              productId: oproduct.productId,
              sku: oproduct.sku,
            },
            { cost: oproduct.cost },
          );
        } else {
          await this.productService.updateRecord(
            {
              id: oproduct.productId,
            },
            { cost: oproduct.cost },
          );
        }
      }
    }
  }*/

  private async updateProductCost(
    arrayToProducts: any[],
    deliveryProductData: any,
    manager?: any,
  ): Promise<void> {
    try {
      // 🔹 Vérification des entrées
      if (!Array.isArray(arrayToProducts) || arrayToProducts.length === 0) {
        throw new Error(
          'Données invalides : arrayToProducts est vide ou non défini.',
        );
      }

      if (!deliveryProductData?.sku || deliveryProductData?.quantity <= 0) {
        throw new Error('Données invalides : sku ou quantity non défini.');
      }

      for (const oproduct of arrayToProducts) {
        // Vérification du SKU et de la quantité > 0
        if (oproduct?.sku === deliveryProductData.sku) {
          console.log(`🔄 Mise à jour du coût pour SKU: ${oproduct.sku}`);

          try {
            if (oproduct?.variantId) {
              if (manager) {
                await manager
                  .getRepository(this.variantToProductService.entity)
                  .update(
                    {
                      id: oproduct.variantId,
                      productId: oproduct.productId,
                      sku: oproduct.sku,
                    },
                    { cost: oproduct.cost },
                  );
              } else {
                await this.variantToProductService.updateRecord(
                  {
                    id: oproduct.variantId,
                    productId: oproduct.productId,
                    sku: oproduct.sku,
                  },
                  { cost: oproduct.cost },
                );
                console.log(
                  `✅ Coût mis à jour pour la variante ID: ${oproduct.variantId}`,
                );
              }
            } else {
              if (manager) {
                await manager
                  .getRepository(this.productService.entity)
                  .update({ id: oproduct.productId }, { cost: oproduct.cost });
              } else {
                await this.productService.updateRecord(
                  { id: oproduct.productId },
                  { cost: oproduct.cost },
                );
                console.log(
                  `✅ Coût mis à jour pour le produit ID: ${oproduct.productId}`,
                );
              }
            }
          } catch (error) {
            console.error(
              `❌ Erreur lors de la mise à jour du produit SKU: ${oproduct.sku}`,
              error.message,
            );
          }
        }
      }
    } catch (error) {
      console.error('❌ Erreur dans updateProductCost:', error.message);
      throw new Error(
        `Erreur lors de la mise à jour du coût des produits : ${error.message}`,
      );
    }
  }

  private async checkStockBeforeDelivery(
    product: any,
    deliveryProductData: any,
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

    console.log(
      `✅ Stock suffisant pour ${product.displayName} (SKU: ${product.sku})`,
    );
    /* } catch (error) {
      console.error('❌ Erreur dans checkStockBeforeDelivery:', error.message);
      throw error;
    }*/
  }

  private analyzeStockIssue(product: Product, currentStock: number): string {
    if (currentStock === 0) {
      return 'Aucun stock disponible. Vérifiez les réapprovisionnements.';
    } else if (currentStock < 5) {
      return 'Stock critique ! Un réapprovisionnement est recommandé.';
    } else {
      return 'Stock insuffisant pour la demande actuelle. Ajustez les quantités ou vérifiez les autres branches.';
    }
  }

  async readOneRecord(options?: FindOneOptions<Delivery>) {
    const res = await this.repository.findOne(options);
    if (!res) {
      throw new BadRequestException(this.NOT_FOUND_MESSAGE);
    }
    const entity = { ...res, totalAmount: 0, deliveryId: res.id } as any;
    entity.totalAmount = this.totalAmount(entity);
    return entity;
  }

  async cancelRecord(option: any): Promise<any> {
    const delivery = await this.readOneRecord({
      relations: {
        deliveryToProducts: { product: true },
        selling: { sellingToProducts: true },
        deliveryToAdditionalCosts: true,
      },
      where: option,
    });

    if (!delivery) throw new BadRequestException('Réception introuvable');
    // Vérifier si déjà annulée
    if (delivery.status === SellingStatusEnum.canceled) {
      throw new BadRequestException('Réception déjà annulée');
    }

    if (delivery.status == SellingStatusEnum.closed) {
      // Mise à jour des stocks Inverser les effets sur le stock
      for (const deliveryToProduct of delivery.deliveryToProducts) {
        const deliveryProductData = {
          ...deliveryToProduct,
          quantity: -deliveryToProduct.quantity,
          orderId: '',
          destinationBranchId: delivery.branchId,
        };
        await this.updateStocks(deliveryProductData);
      }
    }

    // 2. Marquer la réception comme annulée (ou la supprimer)
    await this.updateRecord(
      { id: delivery.id },
      { status: SellingStatusEnum.canceled },
    );
    // 3. Recalculer le statut de la commande liée
    await this.recalculerSellingStatus(delivery);

    const entity = await this.repository.findOneBy({ id: delivery.id });
    if (entity.status == SellingStatusEnum.canceled) {
      const authUser = this.request[REQUEST_AUTH_USER_KEY] as AuthUser;
      entity.canceledById = authUser?.id;
      entity.canceledAt = new Date();
      await this.repository.update(option, entity);
    }
  }

  totalAmount(entity: any): number {
    if (!entity?.deliveryToProducts) {
      return 0;
    }
    const totalDELAMOUNT = entity.deliveryToProducts.reduce(
      (acc, { quantity = 0, cost = 0 }) => acc + quantity * cost,
      0,
    );
    const totalAddAMOUNT =
      entity.deliveryToAdditionalCosts?.reduce(
        (acc, { amount = 0 }) => acc + amount,
        0,
      ) || 0;
    return totalDELAMOUNT + totalAddAMOUNT;
  }

  recalculerSellingStatus = async (delivery: any) => {
    const selling = delivery.selling;
    const otherDeliverys = await this.readListRecord({
      where: {
        sellingId: selling.id,
        status: Not(SellingStatusEnum.canceled),
      },
      relations: { deliveryToProducts: true },
    });

    const totalDelivered = this.calculateTotalDelivered(otherDeliverys);

    const isAllReceived = this.sellingService.isAllDeliveryv2(
      selling.sellingToProducts,
      totalDelivered,
    );

    let newStatus: SellingStatusEnum;

    const totalDeliveredQuantities = Object.values(totalDelivered).reduce(
      (sum, quantity) => sum + quantity,
      0,
    );

    if (totalDeliveredQuantities === 0) {
      newStatus = SellingStatusEnum.pending; // ou 'open'
    } else if (isAllReceived) {
      newStatus = SellingStatusEnum.closed;
    } else {
      newStatus = SellingStatusEnum.partialdelivered;
    }
    await this.sellingService.updateRecord(
      { id: selling.id },
      { status: newStatus },
    );
  };

  calculateTotalDelivered(deliverys: Delivery[]): Record<string, number> {
    const totalDelivered: Record<string, number> = {};
    for (const delivery of deliverys) {
      for (const rtp of delivery.deliveryToProducts) {
        if (!totalDelivered[rtp.sku]) {
          totalDelivered[rtp.sku] = 0;
        }
        totalDelivered[rtp.sku] += rtp.quantity;
      }
    }

    return totalDelivered;
  }

  async validateDelivery(options: any): Promise<any> {
    const delivery = await this.getDeliveryWithRelations(options);

    if (delivery.status !== SellingStatusEnum.pending) {
      throw new BadRequestException([
        "Cette livraison n'est pas en attente de validation.",
      ]);
    }

    const otherClosedDeliveries = await this.getOtherClosedDeliveries(delivery);
    this.validateDeliveredQuantities(delivery, otherClosedDeliveries);
    //await this.ensureSufficientStocks(delivery);
    await this.runInTransactionService.runInTransaction(async (manager) => {
      console.log('Transaction OK uiuiui');
      // Si tout est OK → on valide la réception
      delivery.status = SellingStatusEnum.closed;
      await manager.save(Delivery, delivery);
      // Puis mettre à jour le statut de la commande
      await this.recalculerSellingStatus(delivery);
      await this.applyStockUpdate(delivery, manager);
      // update bundle await this.applyStockMouvementUpdate(delivery, manager);
      const authUser = this.request[REQUEST_AUTH_USER_KEY] as AuthUser;
      delivery.closedById = authUser?.id;
      delivery.closedAt = new Date();
      await manager.save(Delivery, delivery);
    });
  }

  async existClosedRecordBySellingId(sellingId: string): Promise<any> {
    return await this.repository.exists({
      where: {
        sellingId: sellingId,
        status: SellingStatusEnum.closed,
      },
    });
  }

  async getDeliveryWithRelations(options: any) {
    return await this.readOneRecord({
      relations: {
        deliveryToProducts: { product: true },
        selling: { sellingToProducts: true },
        deliveryToAdditionalCosts: true,
      },
      where: { id: options.id, branchId: options.branchId },
    });
  }

  async getOtherClosedDeliveries(delivery) {
    return await this.readListRecord({
      where: {
        sellingId: delivery.sellingId,
        status: Equal(SellingStatusEnum.closed),
        id: Not(delivery.id),
      },
      relations: {
        deliveryToProducts: { product: true },
      },
    });
  }

  private validateDeliveredQuantities(
    delivery: { selling: any; deliveryToProducts: any },
    otherClosedDeliveries: Delivery[],
  ) {
    const selling = delivery.selling;
    const totalDelivered = this.calculateTotalDelivered(otherClosedDeliveries);

    // ⚠️ Ajout des quantités de la réception en cours de validation
    for (const rtp of delivery.deliveryToProducts) {
      const alreadyDelivered = totalDelivered[rtp.sku] || 0;

      const sellinged =
        selling.sellingToProducts.find((o) => o.sku === rtp.sku)?.quantity || 0;

      const totalDeliveredIncludingCurrent = alreadyDelivered + rtp.quantity;
      if (totalDeliveredIncludingCurrent > sellinged) {
        throw new BadRequestException([
          `Tu ne peux pas valider cette livraison : le produit ${rtp.product?.displayName ?? ''}-${rtp.product?.sku ?? ''} dépasserait la quantité commandée (${totalDeliveredIncludingCurrent}/${sellinged}).`,
        ]);
      }
    }
    return true;
  }

  private async ensureSufficientStocks(delivery) {
    // 1. Vérification des stocks et données avant toute modification
    for (const deliveryToProduct of delivery.deliveryToProducts) {
      const deliveryProductData = {
        ...deliveryToProduct,
        destinationBranchId: delivery.branchId,
        sellingId: delivery.sellingId,
      };
      await this.checkStocks(deliveryProductData); // Vérifie que le stock est suffisant
    }
  }
  private async applyStockUpdate(
    delivery: { deliveryToProducts: any },
    manager: EntityManager,
  ) {
    await this.verifyCartStockAndUpdateStock(
      delivery.deliveryToProducts,
      delivery,
      manager,
    );

    /* for (const deliveryToProduct of delivery.deliveryToProducts) {
      const deliveryProductData = {
        ...deliveryToProduct,
        destinationBranchId: delivery.branchId,
        sellingId: delivery.sellingId,
        reference: delivery.reference,
      };
      await this.updateStocks(deliveryProductData, manager);
    }*/
  }

  async updateStockMovements(
    deliveryProductData: any,
    manager?: any,
  ): Promise<void> {
    if (manager) {
      await manager.getRepository(this.stockMovementService.entity).save({
        productId: deliveryProductData.productId,
        quantity: -deliveryProductData.quantity,
        type: StockMovementTypeEnum.output,
        source: StockMovementSourceEnum.delivery,
        branchId: deliveryProductData.destinationBranchId,
        sku: deliveryProductData.sku,
        reference: deliveryProductData.reference,
        sourceId: deliveryProductData.sourceId,
        cost: deliveryProductData.cost,
        reason: ReasonTypeEnum.delivery,
        totalCost: deliveryProductData.quantity * deliveryProductData.cost,
        createdById: deliveryProductData.createdById,
        availableStock: deliveryProductData.availableStock,
      });
    } else {
      // Journaliser le mouvement
      await this.stockMovementService.createRecord({
        productId: deliveryProductData.productId,
        quantity: -deliveryProductData.quantity,
        type: StockMovementTypeEnum.input,
        source: StockMovementSourceEnum.delivery,
        branchId: deliveryProductData.destinationBranchId,
        sku: deliveryProductData.sku,
        reference: deliveryProductData.reference,
        sourceId: deliveryProductData.sourceId,
        cost: deliveryProductData.cost,
        reason: ReasonTypeEnum.delivery,
        totalCost: deliveryProductData.quantity * deliveryProductData.cost,
        isManual: false,
        availableStock: deliveryProductData.availableStock,
      });
    }
  }

  private async applyStockMouvementUpdate(delivery: any, manager?: any) {
    const authUser = this.request[REQUEST_AUTH_USER_KEY] as AuthUser;
    delivery.closedById = authUser?.id;
    for (const deliveryToProduct of delivery.deliveryToProducts) {
      const deliveryProductData = {
        ...deliveryToProduct,
        destinationBranchId: delivery.branchId,
        reference: delivery.reference,
        sourceId: delivery.id,
        createdById: authUser?.id,
      };

      await this.updateStockMovements(deliveryProductData, manager);
    }
  }

  private async generateSellings(dto: any): Promise<any> {
    const ddto: any = {
      customer: dto.transporter,
      plannedFor: dto.date ?? new Date(),
      destinationBranchId: dto.destinationBranchId,
      status: SellingStatusEnum.pending,
      action: SellingStatusEnum.pending,
      sellingToProducts: dto.deliveryToProducts as any,
      sellingToAdditionalCosts: dto.sellingToAdditionalCosts,
      description: 'DEMANDE GENREREE',
    };
    const selling = await this.sellingService.createRecord(ddto);
    const sellingDetails = await this.sellingService.getDetails(selling.id);
    return sellingDetails;
  }
}
