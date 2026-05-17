import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { ProductsService } from './products.service'
import { AdminQueryProductsDto } from './dto/admin-query-products.dto'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { promises as fs } from 'fs'
import { ProductImageModel } from './models/product-image.model'
import { InjectModel } from '@nestjs/sequelize'

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('staff')
export class AdminProductsController {
  constructor(
    private readonly productsService: ProductsService,
    @InjectModel(ProductImageModel)
    private readonly imageModel: typeof ProductImageModel,
  ) {}

  @Get()
  findAllAdmin(@Query() query: AdminQueryProductsDto) {
    return this.productsService.findAllAdmin(query)
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto)
  }

  @Get(':id')
  findOneAdmin(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOneAdmin(id)
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.deactivate(id)
  }

  @Post(':id/images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const unique = uuidv4()
          cb(null, `${unique}${extname(file.originalname)}`)
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp|gif)$/)) {
          return cb(new BadRequestException('Only image files are allowed'), false)
        }
        cb(null, true)
      },
    }),
  )
  async uploadImages(
    @Param('id', ParseUUIDPipe) productId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No images provided')
    }

    const baseDir = './uploads'
    const results: ProductImageModel[] = []

    for (const file of files) {
      const baseName = file.filename.replace(extname(file.filename), '')
      const sizes = [
        { label: 'thumb', width: 300, height: 300 },
        { label: 'medium', width: 600, height: 600 },
        { label: 'large', width: 1200, height: 1200 },
      ]

      for (const size of sizes) {
        const outName = `${baseName}-${size.label}${extname(file.filename)}`
        const outPath = `${baseDir}/${outName}`
        await sharp(file.path)
          .resize(size.width, size.height, { fit: 'inside', withoutEnlargement: true })
          .toFile(outPath)
      }

      const mediumName = `${baseName}-medium${extname(file.filename)}`
      const image = await this.imageModel.create({
        productId,
        url: `/static/uploads/${mediumName}`,
        altText: file.originalname,
        sortOrder: results.length,
        sizeLabel: 'medium',
      } as any)

      results.push(image)
    }

    for (const file of files) {
      try {
        await fs.unlink(file.path)
      } catch {
        // ignore
      }
    }

    return { data: results }
  }

  @Delete(':productId/images/:imageId')
  async deleteImage(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    const image = await this.imageModel.findOne({ where: { id: imageId, productId } })
    if (!image) throw new NotFoundException('Image not found')

    // Remove uploaded files
    try {
      const fileName = image.url.replace('/static/uploads/', '')
      const baseName = fileName.replace(extname(fileName), '')
      const ext = extname(fileName)
      for (const label of ['thumb', 'medium', 'large']) {
        await fs.unlink(`./uploads/${baseName}-${label}${ext}`).catch(() => {})
      }
    } catch {
      // ignore
    }

    await image.destroy()
    return { message: 'Image deleted' }
  }
}
