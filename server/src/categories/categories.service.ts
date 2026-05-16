import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { CategoryModel } from './models/category.model'

export interface CategoryTree {
  id: string
  slug: string
  name: string
  parentId: string | null
  depth: number
  imageUrl: string | null
  sortOrder: number
  children: CategoryTree[]
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(CategoryModel)
    private readonly categoryModel: typeof CategoryModel,
  ) {}

  /** Returns the full category tree (all depths, nested). */
  async findTree(): Promise<CategoryTree[]> {
    const all = await this.categoryModel.findAll({
      where: { isActive: true },
      order: [['sort_order', 'ASC']],
      raw: true,
    })

    const flat = all as unknown as CategoryTree[]
    return this.buildTree(flat, null)
  }

  /** Returns a single category by id. */
  async findOne(id: string): Promise<CategoryModel> {
    const cat = await this.categoryModel.findOne({ where: { id, isActive: true } })
    if (!cat) throw new NotFoundException(`Category ${id} not found`)
    return cat
  }

  /** Returns a single category by slug. */
  async findBySlug(slug: string): Promise<CategoryModel> {
    const cat = await this.categoryModel.findOne({ where: { slug, isActive: true } })
    if (!cat) throw new NotFoundException(`Category "${slug}" not found`)
    return cat
  }

  private buildTree(cats: CategoryTree[], parentId: string | null): CategoryTree[] {
    return cats
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        ...c,
        children: this.buildTree(cats, c.id),
      }))
  }
}
