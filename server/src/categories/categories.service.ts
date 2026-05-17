import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { CategoryModel } from './models/category.model'
import type { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto'

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

  /**
   * Returns the given category id plus every descendant id (any depth).
   * Used by product filtering so /browse/<parent> includes child products.
   */
  async findDescendantIds(rootId: string): Promise<string[]> {
    const all = await this.categoryModel.findAll({
      where: { isActive: true },
      attributes: ['id', 'parentId'],
      raw: true,
    })

    const childrenByParent = new Map<string, string[]>()
    for (const c of all as unknown as Array<{ id: string; parentId: string | null }>) {
      if (!c.parentId) continue
      const list = childrenByParent.get(c.parentId) ?? []
      list.push(c.id)
      childrenByParent.set(c.parentId, list)
    }

    const result: string[] = [rootId]
    const stack = [rootId]
    while (stack.length) {
      const next = stack.pop() as string
      const children = childrenByParent.get(next)
      if (!children) continue
      for (const childId of children) {
        result.push(childId)
        stack.push(childId)
      }
    }
    return result
  }

  async create(dto: CreateCategoryDto) {
    let depth = 0
    if (dto.parentId) {
      const parent = await this.categoryModel.findByPk(dto.parentId)
      if (!parent) throw new NotFoundException('Parent category not found')
      depth = parent.depth + 1
    }

    const cat = await this.categoryModel.create({
      ...dto,
      depth,
      isActive: true,
    } as any)

    return this.toCategory(cat)
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const cat = await this.categoryModel.findByPk(id)
    if (!cat) throw new NotFoundException(`Category ${id} not found`)

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        cat.depth = 0
      } else {
        const parent = await this.categoryModel.findByPk(dto.parentId)
        if (!parent) throw new NotFoundException('Parent category not found')
        cat.depth = parent.depth + 1
      }
    }

    cat.set({ ...dto } as any)
    await cat.save()

    return this.toCategory(cat)
  }

  async deactivate(id: string) {
    const cat = await this.categoryModel.findByPk(id)
    if (!cat) throw new NotFoundException(`Category ${id} not found`)
    cat.isActive = false
    await cat.save()
    return { message: 'Category deactivated' }
  }

  private buildTree(cats: CategoryTree[], parentId: string | null): CategoryTree[] {
    return cats
      .filter((c) => c.parentId === parentId)
      .map((c) => ({
        ...c,
        children: this.buildTree(cats, c.id),
      }))
  }

  private toCategory(cat: CategoryModel) {
    return {
      id: cat.id,
      slug: cat.slug,
      name: cat.name,
      parentId: cat.parentId,
      depth: cat.depth,
      imageUrl: cat.imageUrl,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }
  }
}
