import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { IntakesService } from './intakes.service';
import {
  CreateIntakeDto,
  MatchesQueryDto,
  UpdateIntakeDto,
  QueryIntakeDto,
} from './dto/intake.dto';
import { IntakeAttachment } from './index';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@ApiTags('Intakes - Admin')
@Controller('admin/intakes')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
export class IntakesController {
  constructor(private readonly intakesService: IntakesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new intake (IP or Challenge)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Intake title' },
        content: { type: 'string', description: 'Intake content/description' },
        aiProcessedContent: {
          type: 'string',
          description: 'AI processed content',
        },
        type: {
          type: 'string',
          enum: ['ip', 'challenge'],
          description: 'Type of intake',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published'],
          description: 'Status of intake',
        },
        sectorIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of sector UUIDs',
        },
        confidentialLevel2Content: {
          type: 'string',
          description: 'Confidential level 2 content',
        },
        confidentialLevel2AiProcessedContent: {
          type: 'string',
          description: 'Confidential level 2 AI processed content',
        },
        confidentialLevel3Content: {
          type: 'string',
          description: 'Confidential level 3 content',
        },
        confidentialLevel3AiProcessedContent: {
          type: 'string',
          description: 'Confidential level 3 AI processed content',
        },
        profilePicture: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (image only)',
        },
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Public attachment files (max 10)',
        },
        confidentialLevel2Attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Confidential level 2 attachment files (max 10)',
        },
        confidentialLevel3Attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Confidential level 3 attachment files (max 10)',
        },
      },
      required: ['title'],
    },
  })
  @ApiResponse({ status: 201, description: 'Intake created successfully' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePicture', maxCount: 1 },
        { name: 'attachments', maxCount: 10 },
        { name: 'confidentialLevel2Attachments', maxCount: 10 },
        { name: 'confidentialLevel3Attachments', maxCount: 10 },
      ],
      {
        storage: memoryStorage(),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      },
    ),
  )
  async create(
    @Body() createIntakeDto: CreateIntakeDto,
    @CurrentUser() user: User,
    @UploadedFiles()
    files: {
      profilePicture?: Express.Multer.File[];
      attachments?: Express.Multer.File[];
      confidentialLevel2Attachments?: Express.Multer.File[];
      confidentialLevel3Attachments?: Express.Multer.File[];
    },
  ) {
    const intake = await this.intakesService.create(
      createIntakeDto,
      files?.attachments || [],
      user.id,
      files?.confidentialLevel2Attachments,
      files?.confidentialLevel3Attachments,
      files?.profilePicture?.[0],
    );
    return { success: true, data: intake };
  }

  @Get()
  @ApiOperation({ summary: 'Get all intakes with pagination and filters' })
  @ApiQuery({ name: 'type', required: false, enum: ['ip', 'challenge'] })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published'] })
  @ApiQuery({ name: 'sectorId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Intakes retrieved successfully' })
  async findAll(@Query() query: QueryIntakeDto) {
    const result = await this.intakesService.findAll(query);
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      totalByStatus: result.totalByStatus,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an intake by ID' })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiResponse({ status: 200, description: 'Intake retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Intake not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const intake = await this.intakesService.findOne(id);
    return { success: true, data: intake };
  }

  @Get(':id/matches')
  @ApiOperation({ summary: 'Get paginated pre-computed matches for an intake' })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'Matches retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Intake not found' })
  async findMatches(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: MatchesQueryDto,
  ) {
    const result = await this.intakesService.findMatches(
      id,
      query.page ?? 1,
      query.limit ?? 20,
    );
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an intake with optional file attachments' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Intake title' },
        content: { type: 'string', description: 'Intake content/description' },
        aiProcessedContent: {
          type: 'string',
          description: 'AI processed content',
        },
        type: {
          type: 'string',
          enum: ['ip', 'challenge'],
          description: 'Type of intake',
        },
        status: {
          type: 'string',
          enum: ['draft', 'published'],
          description: 'Status of intake',
        },
        sectorIds: {
          type: 'array',
          items: { type: 'string', format: 'uuid' },
          description: 'Array of sector UUIDs',
        },
        confidentialLevel2Content: {
          type: 'string',
          description: 'Confidential level 2 content',
        },
        confidentialLevel2AiProcessedContent: {
          type: 'string',
          description: 'Confidential level 2 AI processed content',
        },
        confidentialLevel3Content: {
          type: 'string',
          description: 'Confidential level 3 content',
        },
        confidentialLevel3AiProcessedContent: {
          type: 'string',
          description: 'Confidential level 3 AI processed content',
        },
        profilePicture: {
          type: 'string',
          format: 'binary',
          description: 'Profile picture file (image only)',
        },
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Public attachment files to add (max 10)',
        },
        confidentialLevel2Attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Confidential level 2 attachment files to add (max 10)',
        },
        confidentialLevel3Attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Confidential level 3 attachment files to add (max 10)',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Intake updated successfully' })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'profilePicture', maxCount: 1 },
        { name: 'attachments', maxCount: 10 },
        { name: 'confidentialLevel2Attachments', maxCount: 10 },
        { name: 'confidentialLevel3Attachments', maxCount: 10 },
      ],
      {
        storage: memoryStorage(),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      },
    ),
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateIntakeDto: UpdateIntakeDto,
    @UploadedFiles()
    files: {
      profilePicture?: Express.Multer.File[];
      attachments?: Express.Multer.File[];
      confidentialLevel2Attachments?: Express.Multer.File[];
      confidentialLevel3Attachments?: Express.Multer.File[];
    },
  ) {
    const intake = await this.intakesService.update(
      id,
      updateIntakeDto,
      files?.attachments || [],
      files?.confidentialLevel2Attachments,
      files?.confidentialLevel3Attachments,
      files?.profilePicture?.[0],
    );
    return { success: true, data: intake };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an intake' })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiResponse({ status: 200, description: 'Intake deleted successfully' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.intakesService.remove(id);
    return { success: true, message: 'Intake deleted successfully' };
  }

  @Post(':id/beautify')
  @ApiOperation({
    summary: 'Run AI beautification on any intake and save result',
  })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiResponse({ status: 200, description: 'Beautified intake data' })
  async beautify(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.intakesService.beautifyIntake(id);
    return { success: true, data };
  }

  @Post(':id/compute-matches')
  @ApiOperation({
    summary: 'Manually trigger matching for any published intake',
  })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiResponse({ status: 200, description: 'Matching completed successfully' })
  @ApiResponse({ status: 404, description: 'Intake not found' })
  @ApiResponse({
    status: 422,
    description: 'Intake must be published to trigger matching',
  })
  async computeMatches(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.intakesService.computeMatchesManual(id);
    return { success: true, data };
  }

  @Post(':id/attachments')
  @ApiOperation({ summary: 'Upload attachment to an intake' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        fileType: {
          type: 'string',
          enum: ['image', 'video', 'document'],
          description: 'Type of file',
        },
      },
      required: ['file', 'fileType'],
    },
  })
  @ApiResponse({ status: 201, description: 'Attachment uploaded successfully' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('fileType') fileType: string,
  ): Promise<{ success: boolean; data: IntakeAttachment }> {
    const attachment = await this.intakesService.uploadAttachment(
      id,
      file,
      fileType,
    );
    return { success: true, data: attachment };
  }

  @Delete(':id/attachments/:attachmentId')
  @ApiOperation({ summary: 'Delete an attachment' })
  @ApiParam({ name: 'id', description: 'Intake UUID' })
  @ApiParam({ name: 'attachmentId', description: 'Attachment UUID' })
  @ApiResponse({ status: 200, description: 'Attachment deleted successfully' })
  async deleteAttachment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('attachmentId', ParseUUIDPipe) attachmentId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.intakesService.deleteAttachment(attachmentId);
    return { success: true, message: 'Attachment deleted successfully' };
  }
}

@ApiTags('Sectors - Admin')
@Controller('admin/sectors')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
export class SectorsController {
  constructor(private readonly intakesService: IntakesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sectors' })
  @ApiResponse({ status: 200, description: 'Sectors retrieved successfully' })
  async findAll() {
    return await this.intakesService.findAllSectors();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new sector' })
  @ApiResponse({ status: 201, description: 'Sector created successfully' })
  async create(@Body('name') name: string) {
    const sector = await this.intakesService.createSector(name);
    return { success: true, data: sector };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a sector' })
  @ApiParam({ name: 'id', description: 'Sector UUID' })
  @ApiResponse({ status: 200, description: 'Sector updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('name') name: string,
  ) {
    const sector = await this.intakesService.updateSector(id, name);
    return { success: true, data: sector };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sector' })
  @ApiParam({ name: 'id', description: 'Sector UUID' })
  @ApiResponse({ status: 200, description: 'Sector deleted successfully' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.intakesService.deleteSector(id);
    return { success: true, message: 'Sector deleted successfully' };
  }
}

@ApiTags('Categories - Admin')
@Controller('admin/categories')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly intakesService: IntakesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  async findAll() {
    return await this.intakesService.findAllCategories();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  async create(@Body('name') name: string) {
    const category = await this.intakesService.createCategory(name);
    return { success: true, data: category };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('name') name: string,
  ) {
    const category = await this.intakesService.updateCategory(id, name);
    return { success: true, data: category };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 200, description: 'Category deleted successfully' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.intakesService.deleteCategory(id);
    return { success: true, message: 'Category deleted successfully' };
  }
}
