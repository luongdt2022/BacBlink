import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminAuthGuard } from '../auth/guards/admin-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { CollaborationsService } from './collaborations.service';
import {
  CreateCollaborationRequestDto,
  ListCollaborationRequestsDto,
} from './dto/collaboration-request.dto';

// ─── User: Sent requests ──────────────────────────────────────────────────────

@ApiTags('Collaboration Requests - User')
@Controller('my/collaboration-requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MyCollaborationRequestsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @Post()
  @ApiOperation({ summary: 'Send a collaboration request to another intake' })
  @ApiResponse({ status: 201, description: 'Request sent successfully' })
  @ApiResponse({
    status: 400,
    description:
      'Validation error (duplicate, wrong type, not published, self-request)',
  })
  @ApiResponse({
    status: 403,
    description: 'Requester intake does not belong to you',
  })
  @ApiResponse({ status: 404, description: 'Intake not found' })
  async create(
    @Body() dto: CreateCollaborationRequestDto,
    @CurrentUser() user: User,
  ) {
    const data = await this.collaborationsService.create(dto, user.id);
    return { success: true, data };
  }

  @Get('sent')
  @ApiOperation({ summary: 'List collaboration requests sent by me' })
  @ApiResponse({ status: 200, description: 'Sent requests retrieved' })
  async findSent(
    @Query() query: ListCollaborationRequestsDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.collaborationsService.findSent(user.id, query);
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  @Get('received')
  @ApiOperation({ summary: 'List collaboration requests received by me' })
  @ApiResponse({ status: 200, description: 'Received requests retrieved' })
  async findReceived(
    @Query() query: ListCollaborationRequestsDto,
    @CurrentUser() user: User,
  ) {
    const result = await this.collaborationsService.findReceived(
      user.id,
      query,
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

  @Get(':id')
  @ApiOperation({
    summary: 'Get a collaboration request by ID (must be participant)',
  })
  @ApiParam({ name: 'id', description: 'Collaboration request UUID' })
  @ApiResponse({ status: 200, description: 'Request retrieved' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.collaborationsService.findOneForUser(id, user.id);
    return { success: true, data };
  }

  @Post(':id/accept')
  @ApiOperation({
    summary: 'Accept a collaboration request (target user only)',
  })
  @ApiParam({ name: 'id', description: 'Collaboration request UUID' })
  @ApiResponse({
    status: 200,
    description:
      'Request accepted; other pending requests for the same intake are auto-rejected',
  })
  @ApiResponse({ status: 400, description: 'Request is not in pending status' })
  @ApiResponse({
    status: 403,
    description: 'You are not the target of this request',
  })
  async accept(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.collaborationsService.accept(id, user.id);
    return { success: true, data };
  }

  @Post(':id/reject')
  @ApiOperation({
    summary: 'Reject a collaboration request (target user only)',
  })
  @ApiParam({ name: 'id', description: 'Collaboration request UUID' })
  @ApiResponse({ status: 200, description: 'Request rejected' })
  @ApiResponse({ status: 400, description: 'Request is not in pending status' })
  @ApiResponse({
    status: 403,
    description: 'You are not the target of this request',
  })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.collaborationsService.reject(id, user.id);
    return { success: true, data };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancel a pending collaboration request (requester only)',
  })
  @ApiParam({ name: 'id', description: 'Collaboration request UUID' })
  @ApiResponse({ status: 200, description: 'Request cancelled' })
  @ApiResponse({ status: 400, description: 'Request is not in pending status' })
  @ApiResponse({
    status: 403,
    description: 'You are not the requester of this request',
  })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.collaborationsService.cancel(id, user.id);
    return { success: true, data };
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

@ApiTags('Collaboration Requests - Admin')
@Controller('admin/collaboration-requests')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
export class AdminCollaborationRequestsController {
  constructor(private readonly collaborationsService: CollaborationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all collaboration requests (admin)' })
  @ApiResponse({ status: 200, description: 'All requests retrieved' })
  async findAll(@Query() query: ListCollaborationRequestsDto) {
    const result = await this.collaborationsService.findAllAdmin(query);
    return {
      success: true,
      data: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
